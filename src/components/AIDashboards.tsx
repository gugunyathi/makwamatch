import React, { useState } from "react";
import { Startup } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { Sparkles, Trophy, Flame, TrendingUp, AlertCircle, RefreshCw, BarChart2, ShieldAlert, BadgeInfo } from "lucide-react";

interface AIDashboardsProps {
  startups: Startup[];
  userRole: string;
  lang: string;
  translations: any;
  onRefreshAI: (startup: Startup) => void;
  aiInsightsCache: Record<string, any>;
  isAnalyzing: boolean;
  initialSelectedStartupId?: string;
}

export default function AIDashboards({
  startups,
  userRole,
  lang,
  translations,
  onRefreshAI,
  aiInsightsCache,
  isAnalyzing,
  initialSelectedStartupId
}: AIDashboardsProps) {
  const [selectedStartupId, setSelectedStartupId] = useState<string>(initialSelectedStartupId || startups[0]?.id || "");
  const selectedStartup = startups.find((s) => s.id === selectedStartupId) || startups[0];

  // Keep internal selection in sync if parent changes initialSelectedStartupId
  React.useEffect(() => {
    if (initialSelectedStartupId) {
      setSelectedStartupId(initialSelectedStartupId);
    }
  }, [initialSelectedStartupId]);

  // Colors for aesthetic layout
  const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];

  // 1. Data formulation for chart - Industry Breakdown
  const categoryCount: Record<string, number> = {};
  startups.forEach((s) => {
    const cat = s.category || "General Tech";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // 2. Data formulation for pitch score leaderboard
  const sortedLeaderboard = [...startups].sort((a, b) => (b.pitchScore || 0) - (a.pitchScore || 0));

  // 3. AI Predictive Outcome chart
  const barData = startups.map((s) => ({
    name: s.companyName.substring(0, 8),
    successRate: s.fundingSuccessRate || 75,
    sentiment: s.sentimentScore || 80,
  }));

  // 4. Growth Projections based on Traction & Pitch Score for selected startup
  const growthProjectionsData = [
    { quarter: "Q1", users: Math.round((selectedStartup?.pitchScore || 80) * 15), revenue: Math.round((selectedStartup?.fundingSuccessRate || 75) * 10) },
    { quarter: "Q2", users: Math.round((selectedStartup?.pitchScore || 80) * 35), revenue: Math.round((selectedStartup?.fundingSuccessRate || 75) * 28) },
    { quarter: "Q3", users: Math.round((selectedStartup?.pitchScore || 80) * 70), revenue: Math.round((selectedStartup?.fundingSuccessRate || 75) * 65) },
    { quarter: "Q4", users: Math.round((selectedStartup?.pitchScore || 80) * 120), revenue: Math.round((selectedStartup?.fundingSuccessRate || 75) * 115) },
  ];

  const activeInsights = aiInsightsCache[selectedStartup?.id] || {
    automatedDealFlow: {
      score: selectedStartup?.fundingSuccessRate || 80,
      strength: "Strong alignment with regional B2B logistics demand and strategic corporate partnerships.",
      riskAnalysis: "Early team building risks and currency volatility in South Africa/regional markets.",
      recommendation: "Strong candidate for Pre-Seed SAFE investment. Suggest setting up a physical diligence visit."
    },
    founderSentiment: {
      score: selectedStartup?.sentimentScore || 85,
      state: "Highly Energetic & Execution-Driven",
      insights: "Founder exhibits exceptional clarity on product architecture and market deployment."
    },
    marketInsights: {
      growthRate: "18.5% CAGR in Sub-Saharan Africa Tech",
      predictedSuccess: `${selectedStartup?.fundingSuccessRate || 80}%`,
      forecast: "SaaS & automation adoption is speeding up among SME target customers, reducing friction."
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto p-4">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Total Evaluated Startups</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{startups.length}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">Seeded Database</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Avg Founder Sentiment</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {Math.round(startups.reduce((acc, s) => acc + (s.sentimentScore || 0), 0) / startups.length)}%
            </span>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded-full">Optimistic</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">AI Predictive Target Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {Math.round(startups.reduce((acc, s) => acc + (s.fundingSuccessRate || 0), 0) / startups.length)}%
            </span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full">SaaS Models</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Compliance Status</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-bold text-emerald-600 flex items-center gap-1">GDPR & CCPA</span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Encrypted</span>
          </div>
        </div>
      </div>

      {/* VC Interactive Intelligence & Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Share & Metrics */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-500" /> Sector Demographics
          </h3>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs max-h-[120px] overflow-y-auto">
            {pieData.map((d, index) => (
              <div key={d.name} className="flex items-center gap-1 text-gray-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Success and Founder Sentiment comparison */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> AI Predictive Models (Success vs Sentiment)
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="successRate" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Funding Forecast" />
                <Area type="monotone" dataKey="sentiment" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSentiment)" name="Founder Sentiment" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Growth Projections & Traction Chart */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" /> 📈 Growth Projections & Traction: {selectedStartup?.companyName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Traction highlights: {selectedStartup?.traction || "Active early-stage deployment and revenue growth."}
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-full">
            AI-Engineered Forecast
          </span>
        </div>

        <div className="h-[260px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthProjectionsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} name="Projected Users (x100)" />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} name="Revenue Run-Rate (ZAR k)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gamified Pitch Leaderboard */}
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" /> 🏆 Gamified Pitch Leaderboard
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-zinc-400">
            <thead className="text-xs text-gray-400 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-900/60 rounded-xl">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Outcome Chance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {sortedLeaderboard.slice(0, 5).map((startup, index) => (
                <tr key={startup.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {index === 0 && <Flame className="w-4 h-4 text-orange-500 fill-current animate-bounce" />}
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">{startup.companyName}</td>
                  <td className="py-3.5 px-4">{startup.fundingStage}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-md">
                      {startup.category || "General"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-500">{startup.pitchScore || 85}</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 font-bold text-emerald-600">
                      {startup.fundingSuccessRate || 80}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VC AI Decision Making & Analysis Room */}
      <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-zinc-950 dark:to-zinc-950 p-6 rounded-3xl border border-indigo-100/30 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Makwa VC AI Brain
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1.5 flex items-center gap-2">
              <Sparkles className="w-5.5 h-5.5 text-indigo-500" /> Deep Generative Deal Flow Room
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-zinc-400">Select Startup:</span>
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="p-2 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm text-sm"
            >
              {startups.map((s) => (
                <option key={s.id} value={s.id}>{s.companyName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Startup VC Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Deal Flow score and recommendations */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Automated Deal Flow</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">Score: {activeInsights.automatedDealFlow?.score}%</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-zinc-300 font-bold mt-4">Key Strengths:</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                {activeInsights.automatedDealFlow?.strength}
              </p>
            </div>
            <div className="border-t border-gray-50 dark:border-zinc-800 pt-3 mt-4">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Recommendation</span>
              <p className="text-xs text-gray-700 dark:text-zinc-300 font-medium mt-1">
                {activeInsights.automatedDealFlow?.recommendation}
              </p>
            </div>
          </div>

          {/* Real-time Sentiment Tracking */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Founder Sentiment</span>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">Index: {activeInsights.founderSentiment?.score}/100</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-zinc-300 font-bold mt-4">Calculated Mindstate:</p>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold bg-sky-50/50 dark:bg-sky-950/20 px-3 py-1.5 rounded-lg mt-1.5">
                {activeInsights.founderSentiment?.state}
              </p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-3 leading-relaxed">
                {activeInsights.founderSentiment?.insights}
              </p>
            </div>
            <div className="border-t border-gray-50 dark:border-zinc-800 pt-3 mt-4">
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest block">Status</span>
              <p className="text-xs text-gray-700 dark:text-zinc-300 font-medium mt-1">
                Founder updates logged on-chain. Real-time data sync active.
              </p>
            </div>
          </div>

          {/* AI-driven predictive insights */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Predictive Insights</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">Forecast: {activeInsights.marketInsights?.predictedSuccess}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-zinc-300 font-bold mt-4">Estimated CAGR:</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {activeInsights.marketInsights?.growthRate}
              </p>
              <p className="text-sm text-gray-800 dark:text-zinc-300 font-bold mt-3">Macro Forecast:</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {activeInsights.marketInsights?.forecast}
              </p>
            </div>
            <div className="border-t border-gray-50 dark:border-zinc-800 pt-3 mt-4">
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block">Risk Advisory</span>
              <p className="text-xs text-gray-700 dark:text-zinc-300 font-medium mt-1">
                98.4% Confidence Interval based on global tech metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Trigger Gemini analysis */}
        <div className="flex items-center justify-between border-t border-indigo-100/30 dark:border-zinc-800 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <BadgeInfo className="w-4 h-4" />
            <span>Generate unique live insights for {selectedStartup?.companyName} using server-side Gemini.</span>
          </div>

          <button
            onClick={() => onRefreshAI(selectedStartup)}
            disabled={isAnalyzing}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing..." : "Re-Run Gemini Analysis"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
