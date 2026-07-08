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

