import { AdminAnalyticsResponse, MeActivityResponse, SwipeAnalyticsHistoryItem, SwipeAnalyticsSummary } from "../types";

const SESSION_TOKEN_KEY = "makwa_session_token";

export interface DemoPoolPolicyResponse {
  accessTier: "guest" | "signed" | "enterprise";
  policy: {
    guestCount: number;
    signedVariationCount: number;
    signedPoolCount: number;
    description: string;
  };
  guestStartupIds: string[];
  signedVariationStartupIds: string[];
  signedPoolStartupIds: string[];
  visibleStartupIds: string[];
}

export function getSessionToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getSessionToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

export async function apiJson<T>(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await apiFetch(input, init);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "error" in payload ? String(payload.error) : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function getCuratedStartups<T>() {
  return apiJson<T>("/api/startups");
}

export function getDemoPoolPolicy() {
  return apiJson<DemoPoolPolicyResponse>("/api/startups/demo-policy");
}

export function trackSwipeEvent(payload: {
  startupId: string;
  direction: "left" | "right";
  clientSessionId: string;
}) {
  return apiJson<{ success: true }>("/api/analytics/swipe-event", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSwipeSummary(clientSessionId: string) {
  const query = new URLSearchParams({ clientSessionId }).toString();
  return apiJson<SwipeAnalyticsSummary>(`/api/analytics/swipe-summary?${query}`);
}

export function getSwipeHistory(clientSessionId: string, limit = 20) {
  const query = new URLSearchParams({ clientSessionId, limit: String(limit) }).toString();
  return apiJson<{ history: SwipeAnalyticsHistoryItem[] }>(`/api/analytics/swipe-history?${query}`);
}

export function getMeActivity() {
  return apiJson<MeActivityResponse>("/api/me/activity");
}

export function getAdminAnalytics(days = 30) {
  const query = new URLSearchParams({ days: String(days) }).toString();
  return apiJson<AdminAnalyticsResponse>(`/api/admin/analytics?${query}`);
}