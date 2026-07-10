import { Startup } from "../types";
import { GUEST_DEMO_STARTUP_IDS, SIGNED_DEMO_POOL_STARTUP_IDS } from "./demoPoolConfig";

const DEMO_COMPANY_META: Record<string, { companyName: string; country: string; fundingStage: string; revenueStatus: string; category: string }> = {
  "1": { companyName: "Nobztech", country: "South Africa", fundingStage: "Pre-Seed", revenueStatus: "Pre-revenue", category: "EdTech" },
  "2": { companyName: "Covaluation (Pty) Ltd", country: "South Africa", fundingStage: "Seed", revenueStatus: "Pre-revenue", category: "FinTech" },
  "3": { companyName: "VIB3, Inc.", country: "South Africa", fundingStage: "Pre-Seed", revenueStatus: "Pre-revenue", category: "Travel Tech" },
  "4": { companyName: "MILITIA", country: "South Africa", fundingStage: "Seed", revenueStatus: "Pre-revenue", category: "FinTech" },
  "5": { companyName: "NEXERA", country: "South Africa", fundingStage: "Pre-Seed", revenueStatus: "Pre-revenue", category: "EdTech" },
  "6": { companyName: "Brown Financial Services", country: "South Africa", fundingStage: "Angel", revenueStatus: "Pre-revenue", category: "FinTech" },
  "7": { companyName: "Proliink Connect", country: "South Africa", fundingStage: "Seed", revenueStatus: "Pre-revenue", category: "Marketplace" },
  "8": { companyName: "Ipachi Capital", country: "Botswana", fundingStage: "Pre-Seed", revenueStatus: "Pre-revenue", category: "FinTech" },
  "9": { companyName: "Bathwa Resolute Technologies", country: "South Africa", fundingStage: "Pre-Seed", revenueStatus: "Pre-revenue", category: "Climate Tech" },
  "10": { companyName: "eTips (Pty) Ltd", country: "South Africa", fundingStage: "Accelerator", revenueStatus: "Pre-revenue", category: "Payments" },
  "12": { companyName: "Bright is Life", country: "South Africa", fundingStage: "Accelerator", revenueStatus: "Pre-revenue", category: "HealthTech" },
  "15": { companyName: "Spectrogen and Robometre", country: "South Africa", fundingStage: "Seed", revenueStatus: "Pre-revenue", category: "DeepTech" },
  "17": { companyName: "Agrishelves Group", country: "South Africa", fundingStage: "Seed", revenueStatus: "Pre-revenue", category: "AgriTech" },
  "18": { companyName: "HerdTrace", country: "South Africa", fundingStage: "Accelerator", revenueStatus: "Pre-revenue", category: "AgriTech" },
  "19": { companyName: "SPOINK", country: "South Africa", fundingStage: "Angel", revenueStatus: "Pre-revenue", category: "FinTech" },
};

function createStartup(id: string, revealIdentity: boolean, confidentialIndex?: number): Startup {
  const meta = DEMO_COMPANY_META[id] || {
    companyName: `Startup ${id}`,
    country: "South Africa",
    fundingStage: "Seed",
    revenueStatus: "Pre-revenue",
    category: "General",
  };

  if (!revealIdentity) {
    const idx = confidentialIndex || 1;
    return {
      id,
      firstName: "Founder",
      lastName: "Preview",
      email: "signin-required@makwamatch.app",
      phone: "Sign in required",
      companyName: `Confidential Startup ${idx}`,
      website: "https://makwamatch.app/login-required",
      country: meta.country,
      problem: "Sign in to view the full problem statement and market pain points.",
      description: "Protected founder profile. Authenticate to unlock the full company overview.",
      traction: "Private traction metrics available to signed-in users.",
      team: "Founder and team details are hidden until sign-in.",
      fundingStage: meta.fundingStage,
      dealTerms: "Deal terms are visible only to authenticated platform users.",
      category: "Protected",
      pitchScore: 82,
      sentimentScore: 85,
      fundingSuccessRate: 79,
      amountRaised: "Hidden",
      revenueStatus: "Hidden",
      mrr: "Hidden",
      productLinks: [],
      dataroom: {},
    };
  }

  return {
    id,
    firstName: "Founder",
    lastName: "Lead",
    email: `founder-${id}@makwamatch.app`,
    phone: "+27 00 000 0000",
    companyName: meta.companyName,
    website: "https://makwamatch.app/startup-profile",
    country: meta.country,
    problem: `${meta.companyName} addresses a high-impact market challenge with an execution-focused approach.`,
    description: `${meta.companyName} is part of the curated demo pool for investor discovery and deal-flow review.`,
    traction: "Curated demo traction summary available in-app.",
    team: "Founder-led team with technical and operational capabilities.",
    fundingStage: meta.fundingStage,
    dealTerms: "Deal terms available in signed-in and enterprise workflows.",
    category: meta.category,
    pitchScore: 84,
    sentimentScore: 86,
    fundingSuccessRate: 82,
    amountRaised: "ZAR 0 raised",
    revenueStatus: meta.revenueStatus,
    mrr: "ZAR 0 MRR",
    productLinks: [],
    dataroom: {},
  };
}

export function getFastGuestDemoPlaceholders(): Startup[] {
  return GUEST_DEMO_STARTUP_IDS.map((id, index) => createStartup(id, false, index + 1));
}

export function getFastSignedDemoPool(): Startup[] {
  return SIGNED_DEMO_POOL_STARTUP_IDS.map((id) => createStartup(id, true));
}
