import crypto from "crypto";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { MongoClient } from "mongodb";
import { Startup } from "./src/data/startups.js";
import { spreadsheetStartups } from "./src/data/spreadsheetStartups.js";
import { GUEST_DEMO_STARTUP_IDS, SIGNED_VARIATION_STARTUP_IDS } from "./src/data/demoPoolConfig.js";
import { DirectMessage, UserProfile, UserRole } from "./src/types.js";

dotenv.config();

const app = express();
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "makwamatch";
const SESSION_SECRET = process.env.SESSION_SECRET || "local-dev-session-secret-change-me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || process.env.Google_Auth_Client_ID;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

app.use(express.json({ limit: "1mb" }));

if (!MONGO_DB_URI) {
  throw new Error("MONGO_DB_URI environment variable is required");
}

type AuthProvider = "email" | "google" | "phone" | "demo";

interface StartupRecord extends Startup {
  ownerUserId?: string | null;
  ownerEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  bookmarks?: string[];
  likedStartups?: string[];
  superStartups?: string[];
  freeSwipesCount?: number;
  lastSyncedAt?: number;
  licenseTier?: "standard" | "enterprise";
  enterpriseDomain?: string;
}

interface UserRecord extends UserProfile {
  provider: AuthProvider;
  providerUserId?: string;
  passwordHash?: string;
  preferences?: UserPreferences;
  avatarUrl?: string;
  authHistory?: Array<{
    provider: AuthProvider;
    at: string;
    ip?: string;
    userAgent?: string;
    providerUserId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface SessionRecord {
  tokenHash: string;
  userId: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  providerUserId?: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  lastSeenAt?: string;
  ip?: string;
  userAgent?: string;
}

interface SwipeEventRecord {
  id: string;
  userId?: string | null;
  email?: string | null;
  clientSessionId: string;
  startupId: string;
  direction: "left" | "right";
  createdAt: string;
  ip?: string;
  userAgent?: string;
}

interface GoogleTokenInfoResponse {
  aud?: string;
  azp?: string;
  sub?: string;
  email?: string;
  email_verified?: "true" | "false";
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp?: string;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

interface MessageRecord extends DirectMessage {
  createdAt: string;
}

interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  authUser?: UserRecord;
}

const mongoClient = new MongoClient(MONGO_DB_URI);
let databaseReady: Promise<void> | null = null;

function getDatabase() {
  return mongoClient.db(MONGO_DB_NAME);
}

function usersCollection() {
  return getDatabase().collection<UserRecord>("users");
}

function startupsCollection() {
  return getDatabase().collection<StartupRecord>("startups");
}

function messagesCollection() {
  return getDatabase().collection<MessageRecord>("messages");
}

function sessionsCollection() {
  return getDatabase().collection<SessionRecord>("sessions");
}

function swipeEventsCollection() {
  return getDatabase().collection<SwipeEventRecord>("swipe_events");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSessionToken(payload: SessionPayload) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRequestIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim();
  }
  return req.socket.remoteAddress || "";
}

function getRequestUserAgent(req: Request) {
  return String(req.headers["user-agent"] || "").slice(0, 400);
}

async function verifyGoogleIdToken(idToken: string) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) {
    throw new Error("Unable to validate Google identity token");
  }

  const tokenInfo = (await response.json()) as GoogleTokenInfoResponse;
  if (!tokenInfo.sub || !tokenInfo.email) {
    throw new Error("Google token did not include required profile claims");
  }

  if (GOOGLE_CLIENT_ID && tokenInfo.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience does not match configured client ID");
  }

  return tokenInfo;
}

async function verifyGoogleAccessToken(accessToken: string) {
  const tokenInfoResponse = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
  );
  if (!tokenInfoResponse.ok) {
    throw new Error("Unable to validate Google access token");
  }

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfoResponse;
  if (GOOGLE_CLIENT_ID && tokenInfo.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience does not match configured client ID");
  }

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error("Unable to read Google user profile");
  }

  const userInfo = (await userInfoResponse.json()) as GoogleUserInfoResponse;
  if (!userInfo.sub || !userInfo.email) {
    throw new Error("Google profile did not include required claims");
  }

  return {
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
  };
}

async function issueUserSession(user: UserRecord, req: Request, provider: AuthProvider, providerUserId?: string) {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expMs = nowMs + TOKEN_TTL_MS;
  const requestIp = getRequestIp(req);
  const requestUserAgent = getRequestUserAgent(req);

  const token = signSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: expMs,
  });

  await sessionsCollection().insertOne({
    tokenHash: hashSessionToken(token),
    userId: user.id,
    email: user.email,
    role: user.role,
    provider,
    providerUserId,
    createdAt: nowIso,
    expiresAt: new Date(expMs).toISOString(),
    revokedAt: null,
    lastSeenAt: nowIso,
    ip: requestIp,
    userAgent: requestUserAgent,
  });

  await usersCollection().updateOne(
    { id: user.id, authHistory: null as any },
    {
      $set: {
        authHistory: [],
      },
    }
  );

  await usersCollection().updateOne(
    { id: user.id },
    {
      $set: { updatedAt: nowIso },
      $push: {
        authHistory: {
          $each: [
            {
              provider,
              at: nowIso,
              ip: requestIp,
              userAgent: requestUserAgent,
              providerUserId,
            },
          ],
          $slice: -30,
        },
      },
    }
  );

  return token;
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, digest] = storedHash.split(":");
  if (!salt || !digest) {
    return false;
  }

  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(digest, "hex"));
}

function toUserProfile(user: UserRecord): UserProfile {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    company: user.company,
    phone: user.phone,
    investorFocus: user.investorFocus,
  };
}

function redactStartup(startup: StartupRecord): Startup {
  return {
    ...startup,
    firstName: "Founder",
    lastName: "Preview",
    email: "signin-required@makwamatch.app",
    phone: "Sign in required",
    companyName: `Confidential Startup ${startup.id}`,
    website: "https://makwamatch.app/login-required",
    problem: "Sign in to view the full problem statement and market pain points.",
    description: "Protected founder profile. Authenticate to unlock the full company overview.",
    traction: "Private traction metrics available to signed-in users.",
    team: "Founder and team details are hidden until sign-in.",
    dealTerms: "Deal terms are visible only to authenticated platform users.",
    productLinks: [],
    dataroom: {},
  };
}

function stripStartupMetadata(startup: Startup | StartupRecord): Startup {
  const { createdAt, updatedAt, ownerEmail, ownerUserId, ...responseStartup } = startup as StartupRecord;
  return responseStartup;
}

function sortByStartupId(a: StartupRecord, b: StartupRecord) {
  const aNum = Number(a.id);
  const bNum = Number(b.id);
  if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
    return aNum - bNum;
  }
  return a.id.localeCompare(b.id);
}

function getAccessTier(user?: UserRecord): "guest" | "signed" | "enterprise" {
  if (!user) {
    return "guest";
  }
  if (user.preferences?.licenseTier === "enterprise") {
    return "enterprise";
  }
  return "signed";
}

type AccessTier = "guest" | "signed" | "enterprise";

function buildDemoPools(startups: StartupRecord[]) {
  const sorted = [...startups].sort(sortByStartupId);
  const byId = new Map(sorted.map((startup) => [startup.id, startup]));
  const pickByIds = (ids: readonly string[]) =>
    ids.map((id) => byId.get(id)).filter((startup): startup is StartupRecord => Boolean(startup));

  const guestPool = pickByIds(GUEST_DEMO_STARTUP_IDS);
  const signedVariation = pickByIds(SIGNED_VARIATION_STARTUP_IDS);

  // Defensive fallback in case configured IDs are missing from DB.
  if (guestPool.length < 5) {
    const missing = sorted.filter((startup) => !guestPool.some((item) => item.id === startup.id));
    guestPool.push(...missing.slice(0, 5 - guestPool.length));
  }

  if (signedVariation.length < 10) {
    const missing = sorted.filter(
      (startup) =>
        !guestPool.some((item) => item.id === startup.id) &&
        !signedVariation.some((item) => item.id === startup.id)
    );
    signedVariation.push(...missing.slice(0, 10 - signedVariation.length));
  }

  const signedPool = [...guestPool, ...signedVariation].slice(0, 15);
  return { sorted, guestPool, signedVariation, signedPool };
}

function applyTierLimits(startups: StartupRecord[], tier: "guest" | "signed" | "enterprise") {
  const { sorted, guestPool, signedPool } = buildDemoPools(startups);
  if (tier === "enterprise") {
    return sorted;
  }

  if (tier === "guest") {
    return guestPool;
  }
  if (tier === "signed") {
    return signedPool;
  }
  return sorted;
}

function canManageStartup(user: UserRecord, startup: StartupRecord) {
  const ownerEmail = startup.ownerEmail || startup.email || "";
  const emailMatches = ownerEmail ? normalizeEmail(user.email) === normalizeEmail(ownerEmail) : false;
  return user.role === "makwa_vc" || startup.ownerUserId === user.id || emailMatches;
}

async function ensureDatabaseReady() {
  if (!databaseReady) {
    databaseReady = (async () => {
      await mongoClient.connect();

      await usersCollection().createIndex({ id: 1 }, { unique: true });
      await usersCollection().createIndex({ email: 1 }, { unique: true });
      await startupsCollection().createIndex({ id: 1 }, { unique: true });
      await messagesCollection().createIndex({ id: 1 }, { unique: true });
      await messagesCollection().createIndex({ fromId: 1, toId: 1, timestamp: -1 });
      await sessionsCollection().createIndex({ tokenHash: 1 }, { unique: true });
      await sessionsCollection().createIndex({ userId: 1, createdAt: -1 });
      await sessionsCollection().createIndex({ expiresAt: 1 });
      await swipeEventsCollection().createIndex({ id: 1 }, { unique: true });
      await swipeEventsCollection().createIndex({ userId: 1, createdAt: -1 });
      await swipeEventsCollection().createIndex({ clientSessionId: 1, createdAt: -1 });
      await swipeEventsCollection().createIndex({ startupId: 1, createdAt: -1 });

      const seededAt = new Date().toISOString();
      await Promise.all(
        spreadsheetStartups.map((startup) =>
          startupsCollection().updateOne(
            { id: startup.id },
            {
              $set: {
                ...startup,
                ownerEmail: startup.email ? normalizeEmail(startup.email) : null,
                ownerUserId: null,
                updatedAt: seededAt,
              },
              $setOnInsert: {
                createdAt: seededAt,
              },
            },
            { upsert: true }
          )
        )
      );
    })();
  }

  await databaseReady;
}

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await sessionsCollection().findOne({ tokenHash });
  if (!session || session.revokedAt) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    return null;
  }

  await sessionsCollection().updateOne(
    { tokenHash },
    {
      $set: {
        lastSeenAt: new Date().toISOString(),
      },
    }
  );

  return usersCollection().findOne({ id: payload.userId });
}

async function requireAuth(req: AuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  req.authUser = user;
  return user;
}

function buildSwipeSummary(events: SwipeEventRecord[], actorType: "user" | "guest", userId?: string | null, clientSessionId?: string | null) {
  const totalSwipes = events.length;
  const leftSwipes = events.filter((event) => event.direction === "left").length;
  const rightSwipes = events.filter((event) => event.direction === "right").length;
  const uniqueStartupsSwiped = new Set(events.map((event) => event.startupId)).size;
  const ordered = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    actorType,
    userId: userId || null,
    clientSessionId: clientSessionId || null,
    totalSwipes,
    leftSwipes,
    rightSwipes,
    uniqueStartupsSwiped,
    firstSwipeAt: ordered[0]?.createdAt || null,
    lastSwipeAt: ordered[ordered.length - 1]?.createdAt || null,
  };
}

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI features will fallback to mock heuristics.");
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

function getHeuristicAnalysis(startup: Startup) {
  const words = (startup.problem + " " + startup.description + " " + startup.traction).toLowerCase();
  const criteria = {
    scalability: words.includes("ai") || words.includes("software") || words.includes("automation") || words.includes("platform") ? 88 : 75,
    marketFit: words.includes("partnership") || words.includes("revenue") || words.includes("active users") || words.includes("traction") ? 90 : 70,
    viability: words.includes("fund") || words.includes("raise") || words.includes("capital") ? 85 : 72,
  };
  const sentiment = startup.sentimentScore || Math.floor(Math.random() * 20) + 75;
  const predictScore = startup.fundingSuccessRate || Math.floor((criteria.scalability + criteria.marketFit + criteria.viability) / 3);
  return {
    automatedDealFlow: {
      score: predictScore,
      strength: `Strong product market alignment with key focus on solving ${startup.country} localized pain points.`,
      riskAnalysis: "Early seed stage with typical execution and market entry risks, offset by solid founder credentials.",
      recommendation: "Highly recommended for active due diligence based on documented early traction.",
    },
    founderSentiment: {
      score: sentiment,
      state: sentiment > 85 ? "Optimistic & High Momentum" : "Focused & Execution Oriented",
      insights: "Founder exhibits strong commitment and high clarity on monetization drivers.",
    },
    marketInsights: {
      growthRate: "15% YoY average in sector",
      predictedSuccess: `${predictScore}%`,
      forecast: "Strong potential to scale regionally in Sub-Saharan Africa given current regulatory tailwinds.",
    },
  };
}

app.get("/api/health", async (_req: Request, res: Response) => {
  await ensureDatabaseReady();
  res.json({ status: "ok", database: MONGO_DB_NAME, time: new Date().toISOString() });
});

app.post("/api/auth/email", async (req: Request, res: Response) => {
  await ensureDatabaseReady();

  const { email, password, name, company, role } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    company?: string;
    role?: UserRole;
  };

  if (!email || !password || !role) {
    res.status(400).json({ error: "Email, password, and role are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters long" });
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const now = new Date().toISOString();
  const existingUser = await usersCollection().findOne({ email: normalizedEmail });
  let user: UserRecord;

  if (existingUser?.passwordHash) {
    if (!verifyPassword(password, existingUser.passwordHash)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    user = {
      ...existingUser,
      name: name?.trim() || existingUser.name,
      company: company?.trim() || existingUser.company,
      role,
      updatedAt: now,
    };

    await usersCollection().updateOne(
      { id: existingUser.id },
      {
        $set: {
          name: user.name,
          company: user.company,
          role: user.role,
          updatedAt: now,
        },
      }
    );
  } else {
    user = {
      id: existingUser?.id || crypto.randomUUID(),
      email: normalizedEmail,
      role,
      name: name?.trim() || normalizedEmail.split("@")[0],
      company: company?.trim() || (role === "startup" ? "Startup Ventures" : "Makwa Capital"),
      provider: "email",
      passwordHash: hashPassword(password),
      investorFocus:
        role === "investor"
          ? {
              sectors: ["FinTech", "Agritech", "AI SaaS"],
              stages: ["Seed"],
              ticketSizeMin: 50000,
              ticketSizeMax: 500000,
            }
          : undefined,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
      preferences: existingUser?.preferences,
      phone: existingUser?.phone,
      providerUserId: existingUser?.providerUserId,
    };

    await usersCollection().updateOne({ email: normalizedEmail }, { $set: user }, { upsert: true });
  }

  const token = await issueUserSession(user, req, "email", user.providerUserId);

  res.json({ user: toUserProfile(user), token });
});

app.post("/api/auth/session", async (req: Request, res: Response) => {
  await ensureDatabaseReady();

  const { profile, provider, providerUserId } = req.body as {
    profile?: UserProfile;
    provider?: AuthProvider;
    providerUserId?: string;
  };

  if (provider === "google") {
    res.status(400).json({ error: "Use /api/auth/google for Google sign-in" });
    return;
  }

  if (!profile?.email || !profile.role || !profile.name) {
    res.status(400).json({ error: "A valid user profile is required" });
    return;
  }

  const normalizedEmail = normalizeEmail(profile.email);
  const now = new Date().toISOString();
  const existingUser = await usersCollection().findOne({ email: normalizedEmail });
  const user: UserRecord = {
    id: existingUser?.id || profile.id || crypto.randomUUID(),
    email: normalizedEmail,
    role: profile.role,
    name: profile.name.trim(),
    company: profile.company?.trim(),
    phone: profile.phone,
    investorFocus: profile.investorFocus,
    provider: provider || existingUser?.provider || "demo",
    providerUserId: providerUserId || existingUser?.providerUserId,
    passwordHash: existingUser?.passwordHash,
    preferences: existingUser?.preferences,
    createdAt: existingUser?.createdAt || now,
    updatedAt: now,
  };

  await usersCollection().updateOne({ email: normalizedEmail }, { $set: user }, { upsert: true });

  const token = await issueUserSession(user, req, provider || user.provider || "demo", providerUserId || user.providerUserId);

  res.json({ user: toUserProfile(user), token });
});

app.post("/api/auth/google", async (req: Request, res: Response) => {
  await ensureDatabaseReady();

  const { idToken, accessToken, role, company } = req.body as {
    idToken?: string;
    accessToken?: string;
    role?: UserRole;
    company?: string;
  };

  if (!idToken && !accessToken) {
    res.status(400).json({ error: "Google ID token or access token is required" });
    return;
  }

  try {
    const tokenInfo = idToken ? await verifyGoogleIdToken(idToken) : await verifyGoogleAccessToken(accessToken!);
    const normalizedEmail = normalizeEmail(tokenInfo.email || "");
    if (!normalizedEmail) {
      res.status(400).json({ error: "Google account email is required" });
      return;
    }

    const now = new Date().toISOString();
    const existingUser = await usersCollection().findOne({ email: normalizedEmail });
    const resolvedRole: UserRole = role || existingUser?.role || "investor";

    const user: UserRecord = {
      id: existingUser?.id || crypto.randomUUID(),
      email: normalizedEmail,
      role: resolvedRole,
      name: tokenInfo.name?.trim() || existingUser?.name || normalizedEmail.split("@")[0],
      company: company?.trim() || existingUser?.company || (resolvedRole === "startup" ? "Startup Ventures" : "Makwa Capital"),
      phone: existingUser?.phone,
      investorFocus: existingUser?.investorFocus,
      provider: "google",
      providerUserId: tokenInfo.sub,
      passwordHash: existingUser?.passwordHash,
      preferences: existingUser?.preferences,
      avatarUrl: tokenInfo.picture || existingUser?.avatarUrl,
      authHistory: existingUser?.authHistory,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };

    await usersCollection().updateOne({ email: normalizedEmail }, { $set: user }, { upsert: true });
    const token = await issueUserSession(user, req, "google", tokenInfo.sub);

    res.json({
      user: toUserProfile(user),
      token,
      googleProfile: {
        id: tokenInfo.sub,
        name: tokenInfo.name,
        imageUrl: tokenInfo.picture,
        email: tokenInfo.email,
      },
    });
  } catch (error: any) {
    res.status(401).json({ error: error?.message || "Google sign-in failed" });
  }
});

app.post("/api/auth/logout", async (req: Request, res: Response) => {
  await ensureDatabaseReady();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(200).json({ success: true });
    return;
  }

  await sessionsCollection().updateOne(
    { tokenHash: hashSessionToken(token) },
    {
      $set: {
        revokedAt: new Date().toISOString(),
      },
    }
  );

  res.json({ success: true });
});

app.get("/api/me/sessions", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const sessions = await sessionsCollection()
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .project({ tokenHash: 0 })
    .toArray();

  res.json({ sessions, authHistory: user.authHistory || [] });
});

app.get("/api/me/activity", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const [sessions, recentSwipeEvents, allSwipeEvents] = await Promise.all([
    sessionsCollection()
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .project({ tokenHash: 0 })
      .toArray(),
    swipeEventsCollection().find({ userId: user.id }).sort({ createdAt: -1 }).limit(20).toArray(),
    swipeEventsCollection().find({ userId: user.id }).toArray(),
  ]);

  const startupIds = Array.from(new Set(recentSwipeEvents.map((event) => event.startupId)));
  const startups = startupIds.length
    ? await startupsCollection().find({ id: { $in: startupIds } as any }).toArray()
    : [];
  const startupById = new Map(startups.map((startup) => [startup.id, stripStartupMetadata(startup)]));

  res.json({
    sessions,
    authHistory: user.authHistory || [],
    swipeSummary: buildSwipeSummary(allSwipeEvents, "user", user.id, null),
    recentSwipes: recentSwipeEvents.map((event) => ({
      id: event.id,
      startupId: event.startupId,
      direction: event.direction,
      timestamp: event.createdAt,
      startup: startupById.get(event.startupId),
    })),
  });
});

app.get("/api/admin/analytics", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  if (user.role !== "makwa_vc") {
    res.status(403).json({ error: "Admin analytics access requires makwa_vc role" });
    return;
  }

  const windowDays = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const [usersCount, startupsCount, events, startupDocs] = await Promise.all([
    usersCollection().countDocuments({}),
    startupsCollection().countDocuments({}),
    swipeEventsCollection().find({ createdAt: { $gte: windowStart } }).toArray(),
    startupsCollection().find({}, { projection: { id: 1, category: 1 } as any }).toArray(),
  ]);

  const startupCategoryById = new Map(startupDocs.map((startup) => [startup.id, startup.category || "General"]));
  const rightSwipes = events.filter((event) => event.direction === "right").length;
  const leftSwipes = events.filter((event) => event.direction === "left").length;
  const guestSwipeEvents = events.filter((event) => !event.userId).length;
  const authenticatedSwipeEvents = events.filter((event) => Boolean(event.userId)).length;

  const uniqueAuthenticatedUsers = new Set(events.map((event) => event.userId).filter(Boolean)).size;
  const uniqueGuestSessions = new Set(events.map((event) => event.clientSessionId).filter(Boolean)).size;

  const groupedByDay = new Map<string, { total: number; right: number; left: number; actors: Set<string> }>();
  const categoryCounts = new Map<string, number>();

  for (const event of events) {
    const day = event.createdAt.slice(0, 10);
    const actorKey = event.userId || `guest:${event.clientSessionId}`;
    const dayBucket = groupedByDay.get(day) || { total: 0, right: 0, left: 0, actors: new Set<string>() };
    dayBucket.total += 1;
    if (event.direction === "right") {
      dayBucket.right += 1;
    } else {
      dayBucket.left += 1;
    }
    dayBucket.actors.add(actorKey);
    groupedByDay.set(day, dayBucket);

    const category = startupCategoryById.get(event.startupId) || "General";
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }

  const swipesByDay = Array.from(groupedByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, bucket]) => ({
      day,
      total: bucket.total,
      right: bucket.right,
      left: bucket.left,
      uniqueActors: bucket.actors.size,
    }));

  const dailyActiveUsers = swipesByDay.length ? swipesByDay[swipesByDay.length - 1].uniqueActors : 0;
  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  res.json({
    windowDays,
    totals: {
      users: usersCount,
      startups: startupsCount,
      swipeEvents: events.length,
      guestSwipeEvents,
      authenticatedSwipeEvents,
      rightSwipes,
      leftSwipes,
    },
    uniqueActors: {
      uniqueAuthenticatedUsers,
      uniqueGuestSessions,
      dailyActiveUsers,
    },
    swipesByDay,
    topCategories,
  });
});

app.post("/api/analytics/swipe-event", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();

  const authUser = await getAuthenticatedUser(req);
  const { startupId, direction, clientSessionId } = req.body as {
    startupId?: string;
    direction?: "left" | "right";
    clientSessionId?: string;
  };

  if (!startupId || (direction !== "left" && direction !== "right")) {
    res.status(400).json({ error: "startupId and direction are required" });
    return;
  }

  if (!clientSessionId || clientSessionId.trim().length < 8) {
    res.status(400).json({ error: "A valid clientSessionId is required" });
    return;
  }

  const nowIso = new Date().toISOString();
  await swipeEventsCollection().insertOne({
    id: crypto.randomUUID(),
    userId: authUser?.id || null,
    email: authUser?.email || null,
    clientSessionId: clientSessionId.trim(),
    startupId: startupId.trim(),
    direction,
    createdAt: nowIso,
    ip: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  if (authUser) {
    const existingPreferences = authUser.preferences || {};
    const nextCount = Number(existingPreferences.freeSwipesCount || 0) + 1;
    await usersCollection().updateOne(
      { id: authUser.id },
      {
        $set: {
          preferences: {
            ...existingPreferences,
            freeSwipesCount: nextCount,
            lastSyncedAt: Date.now(),
          },
          updatedAt: nowIso,
        },
      }
    );
  }

  res.json({ success: true });
});

app.get("/api/analytics/swipe-summary", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();

  const authUser = await getAuthenticatedUser(req);
  const clientSessionId = String(req.query.clientSessionId || "").trim();

  if (!authUser && !clientSessionId) {
    res.status(400).json({ error: "clientSessionId is required for guest analytics" });
    return;
  }

  const query = authUser ? { userId: authUser.id } : { clientSessionId };
  const events = await swipeEventsCollection().find(query).sort({ createdAt: -1 }).toArray();
  const summary = buildSwipeSummary(events, authUser ? "user" : "guest", authUser?.id || null, authUser ? null : clientSessionId);

  res.json(summary);
});

app.get("/api/analytics/swipe-history", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();

  const authUser = await getAuthenticatedUser(req);
  const clientSessionId = String(req.query.clientSessionId || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 200);

  if (!authUser && !clientSessionId) {
    res.status(400).json({ error: "clientSessionId is required for guest history" });
    return;
  }

  const query = authUser ? { userId: authUser.id } : { clientSessionId };
  const events = await swipeEventsCollection().find(query).sort({ createdAt: -1 }).limit(limit).toArray();
  const startupIds = Array.from(new Set(events.map((event) => event.startupId)));
  const startups = startupIds.length
    ? await startupsCollection().find({ id: { $in: startupIds } as any }).toArray()
    : [];

  const startupById = new Map(startups.map((startup) => [startup.id, stripStartupMetadata(startup)]));
  const tier = getAccessTier(authUser || undefined);

  res.json({
    history: events.map((event) => {
      const startup = startupById.get(event.startupId);
      const protectedStartup = startup && tier === "guest" ? redactStartup(startup as StartupRecord) : startup;
      return {
        id: event.id,
        startupId: event.startupId,
        direction: event.direction,
        timestamp: event.createdAt,
        startup: protectedStartup,
      };
    }),
  });
});

app.get("/api/auth/me", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  res.json({ user: toUserProfile(user) });
});

app.get("/api/startups", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  req.authUser = await getAuthenticatedUser(req) || undefined;
  const tier = getAccessTier(req.authUser);
  const startups = await startupsCollection().find({}).toArray();
  const visibleStartups = applyTierLimits(startups, tier);
  const data = tier === "guest" ? visibleStartups.map(redactStartup) : visibleStartups;
  res.json(data.map(stripStartupMetadata));
});

app.get("/api/startups/demo-policy", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  req.authUser = await getAuthenticatedUser(req) || undefined;
  const tier: AccessTier = getAccessTier(req.authUser);
  const startups = await startupsCollection().find({}).toArray();
  const { guestPool, signedVariation, signedPool } = buildDemoPools(startups);
  const visibleStartups = applyTierLimits(startups, tier);

  res.json({
    accessTier: tier,
    policy: {
      guestCount: 5,
      signedVariationCount: 10,
      signedPoolCount: 15,
      description: "Guest sees fixed 5 pre-seed startups; signed non-enterprise sees fixed 15 total (5 + 10 variation).",
    },
    guestStartupIds: guestPool.map((startup) => startup.id),
    signedVariationStartupIds: signedVariation.map((startup) => startup.id),
    signedPoolStartupIds: signedPool.map((startup) => startup.id),
    visibleStartupIds: visibleStartups.map((startup) => startup.id),
  });
});

app.get("/api/startups/:startupId", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  req.authUser = await getAuthenticatedUser(req) || undefined;
  const startup = await startupsCollection().findOne({ id: req.params.startupId });
  if (!startup) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }

  const tier = getAccessTier(req.authUser);
  const startups = await startupsCollection().find({}).toArray();
  const visibleIds = new Set(applyTierLimits(startups, tier).map((s) => s.id));
  if (!visibleIds.has(startup.id)) {
    res.status(403).json({ error: "This startup is not available on your current access tier" });
    return;
  }

  const data = tier === "guest" ? redactStartup(startup) : startup;
  res.json(stripStartupMetadata(data));
});

app.get("/api/me/preferences", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  res.json(user.preferences || {});
});

app.put("/api/me/preferences", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const preferences = req.body as UserPreferences;
  await usersCollection().updateOne(
    { id: user.id },
    {
      $set: {
        preferences: {
          bookmarks: Array.isArray(preferences.bookmarks) ? preferences.bookmarks : [],
          likedStartups: Array.isArray(preferences.likedStartups) ? preferences.likedStartups : [],
          superStartups: Array.isArray(preferences.superStartups) ? preferences.superStartups : [],
          freeSwipesCount: Number(preferences.freeSwipesCount || 0),
          lastSyncedAt: preferences.lastSyncedAt || Date.now(),
          licenseTier: preferences.licenseTier === "enterprise" ? "enterprise" : "standard",
          enterpriseDomain: preferences.enterpriseDomain ? normalizeEmail(preferences.enterpriseDomain) : "",
        },
        updatedAt: new Date().toISOString(),
      },
    }
  );
  res.json({ success: true });
});

app.post("/api/me/license/enterprise", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const { domain } = req.body as { domain?: string };
  const normalizedDomain = String(domain || "").trim().toLowerCase();
  if (!normalizedDomain) {
    res.status(400).json({ error: "A valid enterprise domain is required" });
    return;
  }

  const existingPreferences = user.preferences || {};
  const updatedPreferences: UserPreferences = {
    ...existingPreferences,
    licenseTier: "enterprise",
    enterpriseDomain: normalizedDomain,
    lastSyncedAt: Date.now(),
  };

  await usersCollection().updateOne(
    { id: user.id },
    {
      $set: {
        preferences: updatedPreferences,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  res.json({ success: true, licenseTier: "enterprise", enterpriseDomain: normalizedDomain });
});

app.post("/api/startups", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const incoming = req.body as Partial<Startup>;
  if (!incoming.companyName || !incoming.problem || !incoming.description) {
    res.status(400).json({ error: "companyName, problem, and description are required" });
    return;
  }

  const now = new Date().toISOString();
  const userNameParts = user.name.split(" ");
  const startup: StartupRecord = {
    id: incoming.id || crypto.randomUUID(),
    firstName: incoming.firstName || userNameParts[0] || "Founder",
    lastName: incoming.lastName || userNameParts.slice(1).join(" ") || "",
    email: incoming.email || user.email,
    phone: incoming.phone || user.phone || "",
    companyName: incoming.companyName,
    website: incoming.website || "",
    country: incoming.country || "South Africa",
    problem: incoming.problem,
    description: incoming.description,
    traction: incoming.traction || "",
    team: incoming.team || user.name,
    fundingStage: incoming.fundingStage || "Pre-Seed",
    dealTerms: incoming.dealTerms || "",
    pitchScore: incoming.pitchScore,
    category: incoming.category,
    sentimentScore: incoming.sentimentScore,
    fundingSuccessRate: incoming.fundingSuccessRate,
    pitchVideoUrl: incoming.pitchVideoUrl,
    amountRaised: incoming.amountRaised,
    revenueStatus: incoming.revenueStatus,
    mrr: incoming.mrr,
    logoUrl: incoming.logoUrl,
    founderPhoto1: incoming.founderPhoto1,
    founderPhoto2: incoming.founderPhoto2,
    productLinks: incoming.productLinks || [],
    dataroom: incoming.dataroom || {},
    ownerUserId: user.id,
    ownerEmail: user.email,
    createdAt: now,
    updatedAt: now,
  };

  await startupsCollection().updateOne(
    { id: startup.id },
    { $set: startup, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );

  const { createdAt, updatedAt, ownerEmail, ownerUserId, ...responseStartup } = startup;
  res.json({ success: true, startup: responseStartup });
});

app.patch("/api/startups/:startupId", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const startup = await startupsCollection().findOne({ id: req.params.startupId });
  if (!startup) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }

  if (!canManageStartup(user, startup)) {
    res.status(403).json({ error: "You are not allowed to update this startup" });
    return;
  }

  const updates = req.body as Partial<Startup>;
  const updatedStartup: StartupRecord = {
    ...startup,
    ...updates,
    id: startup.id,
    ownerUserId: startup.ownerUserId,
    ownerEmail: startup.ownerEmail,
    createdAt: startup.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await startupsCollection().updateOne({ id: startup.id }, { $set: updatedStartup });
  const { createdAt, updatedAt, ownerEmail, ownerUserId, ...responseStartup } = updatedStartup;
  res.json({ success: true, startup: responseStartup });
});

app.post("/api/ai/analyze", async (req: Request, res: Response) => {
  await ensureDatabaseReady();
  const { startupId } = req.body;
  const startupRecord = await startupsCollection().findOne({ id: String(startupId) });
  if (!startupRecord) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }

  const { createdAt, updatedAt, ownerEmail, ownerUserId, ...startup } = startupRecord;

  try {
    const ai = getAI();
    const prompt = `
      You are an expert venture capital partner at Makwa VC.
      Analyze the following startup details and provide structural insights:
      Company: ${startup.companyName}
      Founder: ${startup.firstName} ${startup.lastName}
      Country: ${startup.country}
      Problem: ${startup.problem}
      Description: ${startup.description}
      Traction: ${startup.traction}
      Team: ${startup.team}
      Funding Stage: ${startup.fundingStage}
      Deal Terms: ${startup.dealTerms}

      Provide your analysis in clean JSON format matching this schema exactly:
      {
        "automatedDealFlow": {
          "score": 85,
          "strength": "Detailed strengths list...",
          "riskAnalysis": "Critical risk analysis...",
          "recommendation": "VC decision recommendation..."
        },
        "founderSentiment": {
          "score": 90,
          "state": "State of mind (Optimistic/Focused/etc.)",
          "insights": "Inferred sentiment tracking details..."
        },
        "marketInsights": {
          "growthRate": "Market CAGR estimate",
          "predictedSuccess": "Predicted probability of success (e.g. 84%)",
          "forecast": "Sector trends and regulatory forecast..."
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "";
    const cleanJSON = JSON.parse(resultText);
    res.json(cleanJSON);
  } catch (err: any) {
    console.error("Gemini analysis error, using heuristics:", err.message);
    res.json(getHeuristicAnalysis(startup));
  }
});

app.post("/api/ai/compatibility", async (req: Request, res: Response) => {
  await ensureDatabaseReady();
  const { investorProfile, startupId } = req.body;
  const startupRecord = await startupsCollection().findOne({ id: String(startupId) });
  if (!startupRecord) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }

  const { createdAt, updatedAt, ownerEmail, ownerUserId, ...startup } = startupRecord;

  try {
    const ai = getAI();
    const prompt = `
      Analyze the compatibility between this Investor and this Startup:
      
      Investor Focus: ${JSON.stringify(investorProfile)}
      Startup:
      Name: ${startup.companyName}
      Category: ${startup.category}
      Problem: ${startup.problem}
      Funding Stage: ${startup.fundingStage}
      Traction: ${startup.traction}
      
      Provide a percentage compatibility score and brief feedback in JSON format:
      {
        "score": 85,
        "matchCriteria": ["Stage match", "Sector alignment"],
        "feedback": "Why this investor is a good match or mismatch."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "";
    const cleanJSON = JSON.parse(resultText);
    res.json(cleanJSON);
  } catch {
    const score = startup.category?.toLowerCase().includes("fin") && investorProfile.sectors?.includes("FinTech") ? 92 : 78;
    res.json({
      score,
      matchCriteria: ["SaaS & Enterprise alignment", "Stage match"],
      feedback: `Solid alignment with investor's stated interest in ${startup.fundingStage} rounds.`,
    });
  }
});

app.post("/api/ai/pitch-assistant", async (req: Request, res: Response) => {
  const { rawText, companyName } = req.body;

  try {
    const ai = getAI();
    const prompt = `
      You are an AI startup architect.
      The founder has provided the following raw, messy information about their company ${companyName || ""}:
      "${rawText}"
      
      Organize and upgrade this information into a polished investor-ready pitch structure.
      Generate a professional, compelling, and readable output in JSON format matching this schema:
      {
        "companyName": "Polished Company Name",
        "problem": "Clear, compelling problem statement (max 100 words)",
        "description": "Polished description of the solution/product (max 120 words)",
        "traction": "Aggregated highlights of traction & pilots",
        "team": "Polished team summaries",
        "suggestedCategory": "e.g. AgriTech / FinTech / EdTech"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "";
    const cleanJSON = JSON.parse(resultText);
    res.json(cleanJSON);
  } catch {
    res.json({
      companyName: companyName || "New Startup",
      problem: rawText ? `${String(rawText).substring(0, 150)}...` : "No clear problem stated.",
      description: "Solution details are being formulated.",
      traction: "Early development stage.",
      team: "Founder and early builders.",
      suggestedCategory: "General SaaS",
    });
  }
});

app.post("/api/messages", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const { toId, content, encrypted } = req.body as Partial<DirectMessage>;
  if (!toId || !content?.trim()) {
    res.status(400).json({ error: "Message recipient and content are required" });
    return;
  }

  const message: MessageRecord = {
    id: crypto.randomUUID(),
    fromId: user.id,
    toId,
    content: content.trim(),
    encrypted: Boolean(encrypted),
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await messagesCollection().insertOne(message);
  res.json({ success: true, message });
});

app.get("/api/messages/:participantId", async (req: AuthenticatedRequest, res: Response) => {
  await ensureDatabaseReady();
  const user = await requireAuth(req, res);
  if (!user) {
    return;
  }

  const participantId = req.params.participantId;
  const messages = await messagesCollection()
    .find({
      $or: [
        { fromId: user.id, toId: participantId },
        { fromId: participantId, toId: user.id },
      ],
    })
    .sort({ timestamp: 1 })
    .toArray();

  res.json(messages.map(({ createdAt, ...message }) => message));
});

export { app, ensureDatabaseReady };
