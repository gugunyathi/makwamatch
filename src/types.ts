export interface Startup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  country: string;
  problem: string;
  description: string;
  traction: string;
  team: string;
  fundingStage: string;
  dealTerms: string;
  pitchScore?: number;
  category?: string;
  sentimentScore?: number;
  fundingSuccessRate?: number;
  compatScores?: Record<string, number>;
  pitchVideoUrl?: string;
  amountRaised?: string;
  revenueStatus?: string;
  mrr?: string;
  logoUrl?: string;
  founderPhoto1?: string;
  founderPhoto2?: string;
  productLinks?: string[];
  dataroom?: {
    pitchDeck?: string;
    capTable?: string;
    financialModel?: string;
    legalDocs?: string;
    teamBios?: string;
  };
}

export function getTractionSummary(startup: Startup): string {
  const raised = startup.amountRaised || "ZAR 0 raised";
  const revenue = startup.revenueStatus || "Pre-revenue";
  const mrr = startup.mrr || "ZAR 0 MRR";
  return `${raised} | ${revenue} | ${mrr}`;
}

export type UserRole = "startup" | "investor" | "makwa_vc";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  company?: string;
  phone?: string;
  investorFocus?: {
    sectors: string[];
    stages: string[];
    ticketSizeMin: number;
    ticketSizeMax: number;
  };
}

export interface DirectMessage {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  encrypted: boolean;
  timestamp: string;
}

export interface SwipeMatch {
  id: string;
  startupId: string;
  investorId: string;
  status: "liked" | "disliked" | "matched";
  createdAt: string;
}

export interface SwipeHistoryItem {
  id: string;
  startup: Startup;
  direction: "left" | "right";
  timestamp: number;
}

export interface SwipeAnalyticsSummary {
  actorType: "user" | "guest";
  userId?: string | null;
  clientSessionId?: string | null;
  totalSwipes: number;
  leftSwipes: number;
  rightSwipes: number;
  uniqueStartupsSwiped: number;
  firstSwipeAt?: string | null;
  lastSwipeAt?: string | null;
}

export interface SwipeAnalyticsHistoryItem {
  id: string;
  startupId: string;
  direction: "left" | "right";
  timestamp: string;
  startup?: Startup;
}

export interface SessionActivityItem {
  userId: string;
  email: string;
  role: UserRole;
  provider: "email" | "google" | "phone" | "demo";
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  lastSeenAt?: string;
  ip?: string;
  userAgent?: string;
}

export interface MeActivityResponse {
  sessions: SessionActivityItem[];
  authHistory: Array<{
    provider: "email" | "google" | "phone" | "demo";
    at: string;
    ip?: string;
    userAgent?: string;
    providerUserId?: string;
  }>;
  swipeSummary: SwipeAnalyticsSummary;
  recentSwipes: SwipeAnalyticsHistoryItem[];
}

export interface AdminAnalyticsResponse {
  windowDays: number;
  totals: {
    users: number;
    startups: number;
    swipeEvents: number;
    guestSwipeEvents: number;
    authenticatedSwipeEvents: number;
    rightSwipes: number;
    leftSwipes: number;
  };
  uniqueActors: {
    uniqueAuthenticatedUsers: number;
    uniqueGuestSessions: number;
    dailyActiveUsers: number;
  };
  swipesByDay: Array<{
    day: string;
    total: number;
    right: number;
    left: number;
    uniqueActors: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

