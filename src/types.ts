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
  dataroom?: {
    pitchDeck?: string;
    capTable?: string;
    financialModel?: string;
    legalDocs?: string;
    teamBios?: string;
  };
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

