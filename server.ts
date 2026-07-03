import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initialStartups, Startup } from "./src/data/startups";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory fallback database that syncs with clients
let startupsDatabase: Startup[] = [...initialStartups];
let messagesDatabase: any[] = [];
let investorMatches: any[] = [];

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

// Heuristic backup if API key is not present
function getHeuristicAnalysis(startup: Startup) {
  const words = (startup.problem + " " + startup.description + " " + startup.traction).toLowerCase();
  const criteria = {
    scalability: words.includes("ai") || words.includes("software") || words.includes("automation") || words.includes("platform") ? 88 : 75,
    marketFit: words.includes("partnership") || words.includes("revenue") || words.includes("active users") || words.includes("traction") ? 90 : 70,
    viability: words.includes("fund") || words.includes("raise") || words.includes("capital") ? 85 : 72
  };
  const sentiment = startup.sentimentScore || Math.floor(Math.random() * 20) + 75;
  const predictScore = startup.fundingSuccessRate || Math.floor((criteria.scalability + criteria.marketFit + criteria.viability) / 3);
  return {
    automatedDealFlow: {
      score: predictScore,
      strength: `Strong product market alignment with key focus on solving ${startup.country} localized pain points.`,
      riskAnalysis: "Early seed stage with typical execution and market entry risks, offset by solid founder credentials.",
      recommendation: "Highly recommended for active due diligence based on documented early traction."
    },
    founderSentiment: {
      score: sentiment,
      state: sentiment > 85 ? "Optimistic & High Momentum" : "Focused & Execution Oriented",
      insights: "Founder exhibits strong commitment and high clarity on monetization drivers."
    },
    marketInsights: {
      growthRate: "15% YoY average in sector",
      predictedSuccess: `${predictScore}%`,
      forecast: "Strong potential to scale regionally in Sub-Saharan Africa given current regulatory tailwinds."
    }
  };
}

// 1. Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Startups list
app.get("/api/startups", (req: Request, res: Response) => {
  res.json(startupsDatabase);
});

// 3. Sync/upload startups from clients
app.post("/api/startups/sync", (req: Request, res: Response) => {
  const clientStartups = req.body as Startup[];
  if (Array.isArray(clientStartups)) {
    clientStartups.forEach((cs) => {
      const idx = startupsDatabase.findIndex((s) => s.id === cs.id);
      if (idx !== -1) {
        startupsDatabase[idx] = { ...startupsDatabase[idx], ...cs };
      } else {
        startupsDatabase.push(cs);
      }
    });
  }
  res.json({ success: true, count: startupsDatabase.length });
});

// 4. Update or create individual startup
app.post("/api/startups", (req: Request, res: Response) => {
  const newStartup = req.body as Startup;
  if (!newStartup.id) {
    newStartup.id = String(startupsDatabase.length + 1);
  }
  const idx = startupsDatabase.findIndex((s) => s.id === newStartup.id);
  if (idx !== -1) {
    startupsDatabase[idx] = { ...startupsDatabase[idx], ...newStartup };
  } else {
    startupsDatabase.push(newStartup);
  }
  res.json({ success: true, startup: newStartup });
});

// 5. Automated Deal Flow & AI Insights using Gemini
app.post("/api/ai/analyze", async (req: Request, res: Response) => {
  const { startupId } = req.body;
  const startup = startupsDatabase.find((s) => s.id === String(startupId));
  if (!startup) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }

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

// 6. Compatibility Score
app.post("/api/ai/compatibility", async (req: Request, res: Response) => {
  const { investorProfile, startupId } = req.body;
  const startup = startupsDatabase.find((s) => s.id === String(startupId));
  if (!startup) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }

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
  } catch (err) {
    // Heuristic fallback
    const score = startup.category?.toLowerCase().includes("fin") && investorProfile.sectors?.includes("FinTech") ? 92 : 78;
    res.json({
      score,
      matchCriteria: ["SaaS & Enterprise alignment", "Stage match"],
      feedback: `Solid alignment with investor's stated interest in ${startup.fundingStage} rounds.`
    });
  }
});

// 7. AI Pitch and Card Builder Assistant
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
  } catch (err) {
    res.json({
      companyName: companyName || "New Startup",
      problem: rawText ? rawText.substring(0, 150) + "..." : "No clear problem stated.",
      description: "Solution details are being formulated.",
      traction: "Early development stage.",
      team: "Founder and early builders.",
      suggestedCategory: "General SaaS"
    });
  }
});

// 8. Direct Messages Database Sync
app.post("/api/messages", (req: Request, res: Response) => {
  const { fromId, toId, content, encrypted } = req.body;
  const newMessage = {
    id: String(messagesDatabase.length + 1),
    fromId,
    toId,
    content,
    encrypted,
    timestamp: new Date().toISOString()
  };
  messagesDatabase.push(newMessage);
  res.json({ success: true, message: newMessage });
});

app.get("/api/messages/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  const filtered = messagesDatabase.filter(
    (m) => m.fromId === userId || m.toId === userId
  );
  res.json(filtered);
});

// Vite middleware and general static routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Makwa-Match server running on port ${PORT}`);
  });
}

startServer();
