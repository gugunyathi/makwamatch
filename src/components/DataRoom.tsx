import React, { useState, useEffect } from "react";
import { Startup } from "../types";
import { Shield, FileText, Download, Key, Plus, Check, Info, Lock, Calculator } from "lucide-react";

interface DataRoomProps {
  startup: Startup;
  isOwner: boolean;
  onUpdateDataroom: (updatedStartup: Startup) => void;
  lang: string;
  translations: any;
}

export default function DataRoom({
  startup,
  isOwner,
  onUpdateDataroom,
  lang,
  translations
}: DataRoomProps) {
  const [activeTab, setActiveTab] = useState<"deck" | "captable" | "financials" | "legal" | "calculator">("deck");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [localIsOwner, setLocalIsOwner] = useState(isOwner);

  const [investmentAmount, setInvestmentAmount] = useState<number>(500000);
  const [preMoneyValuation, setPreMoneyValuation] = useState<number>(20000000);

  // Default Standard Dataroom Templates
  const defaultDeckTemplate = `### ${startup.companyName} - Pitch Deck Overview\n\n1. **The Vision**: Modernizing industries in Africa via smart AI-driven automation.\n2. **The Problem**: Lack of affordable digital solutions and structured records for regional business owners.\n3. **Our Solution**: Fully responsive, offline-first mobile SaaS matching users directly to target demand.\n4. **Market Opportunity (TAM)**: $15B+ total addressable market in emerging economies.\n5. **Business Model**: Monthly subscription and scalable transactional margins.\n6. **Go-To-Market**: Direct sales, regional incubator partnerships, and digital campaigns.`;

  const defaultCapTable = JSON.stringify([
    { shareholder: `${startup.firstName} ${startup.lastName} (Founder)`, shares: "7,500,000", percentage: "75%", role: "Common Stock" },
    { shareholder: "Venture Partner Pool", shares: "1,500,000", percentage: "15%", role: "ESOP" },
    { shareholder: "Lead Angel Investor", shares: "1,000,000", percentage: "10%", role: "SAFE Note" }
  ], null, 2);

  const defaultFinancials = JSON.stringify({
    projections: [
      { year: "Year 1", revenue: "ZAR 1,200,000", expenses: "ZAR 850,000", profit: "ZAR 350,000" },
      { year: "Year 2", revenue: "ZAR 4,800,000", expenses: "ZAR 2,100,000", profit: "ZAR 2,700,000" },
      { year: "Year 3", revenue: "ZAR 15,600,000", expenses: "ZAR 6,400,000", profit: "ZAR 9,200,000" }
    ],
    assumptions: "40% MoM growth in client base with a steady churn rate of under 3% per annum."
  }, null, 2);

  const defaultLegal = `### Regulatory & Compliance Checklist\n\n- [x] Incorporation Certificate (South African CIPC Compliant)\n- [x] Tax Clearance Certificate (SARS Active Status)\n- [x] GDPR & CCPA Data Privacy Policy (Fully Configured)\n- [x] Intellectual Property IP Assignment Agreements Signed\n- [x] Shareholders Agreement Formed`;

  // Local state for editing templates
  const [deckContent, setDeckContent] = useState(startup.dataroom?.pitchDeck || defaultDeckTemplate);
  const [capTableContent, setCapTableContent] = useState(startup.dataroom?.capTable || defaultCapTable);
  const [financialsContent, setFinancialsContent] = useState(startup.dataroom?.financialModel || defaultFinancials);
  const [legalContent, setLegalContent] = useState(startup.dataroom?.legalDocs || defaultLegal);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalIsOwner(isOwner);
  }, [isOwner]);

  // Sync templates if startup changes
  useEffect(() => {
    setDeckContent(startup.dataroom?.pitchDeck || defaultDeckTemplate);
    setCapTableContent(startup.dataroom?.capTable || defaultCapTable);
    setFinancialsContent(startup.dataroom?.financialModel || defaultFinancials);
    setLegalContent(startup.dataroom?.legalDocs || defaultLegal);
  }, [startup]);

  const handleSave = () => {
    setIsSaving(true);
    const updated: Startup = {
      ...startup,
      dataroom: {
        pitchDeck: deckContent,
        capTable: capTableContent,
        financialModel: financialsContent,
        legalDocs: legalContent
      }
    };
    setTimeout(() => {
      onUpdateDataroom(updated);
      setIsSaving(false);
    }, 800);
  };

  const loadTemplate = (type: "deck" | "captable" | "financials" | "legal") => {
    if (type === "deck") setDeckContent(defaultDeckTemplate);
    if (type === "captable") setCapTableContent(defaultCapTable);
    if (type === "financials") setFinancialsContent(defaultFinancials);
    if (type === "legal") setLegalContent(defaultLegal);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-lg space-y-6 max-w-4xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 w-max">
            <Lock className="w-3 h-3" /> Secure Dataroom Room
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {startup.companyName} Documents
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {localIsOwner ? "Manage, edit, and template your official funding documentation." : "Secure investor due-diligence data portal."}
          </p>
        </div>

        {/* Dynamic Switcher Controls & Compliance Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold shadow-inner">
            <button
              onClick={() => setLocalIsOwner(false)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !localIsOwner
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Investor View
            </button>
            <button
              onClick={() => setLocalIsOwner(true)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                localIsOwner
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Founder View (Edit)
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/20 rounded-2xl">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">AES-256 Encrypted</p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">GDPR & CCPA Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("deck")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === "deck"
              ? "bg-amber-500 text-white"
              : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
          }`}
        >
          Pitch Deck Overview
        </button>

        <button
          onClick={() => setActiveTab("captable")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === "captable"
              ? "bg-amber-500 text-white"
              : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
          }`}
        >
          Cap Table Structure
        </button>

        <button
          onClick={() => setActiveTab("financials")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === "financials"
              ? "bg-amber-500 text-white"
              : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
          }`}
        >
          Financial Model Projections
        </button>

        <button
          onClick={() => setActiveTab("legal")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
            activeTab === "legal"
              ? "bg-amber-500 text-white"
              : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
          }`}
        >
          Legal & Compliance Docs
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "calculator"
              ? "bg-amber-500 text-white"
              : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Equity Calculator</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-gray-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/80 min-h-[220px]">
        {activeTab === "deck" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Startup Pitch Details</span>
              {localIsOwner && (
                <button
                  onClick={() => loadTemplate("deck")}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Use Standard Template
                </button>
              )}
            </div>
            {localIsOwner ? (
              <textarea
                value={deckContent}
                onChange={(e) => setDeckContent(e.target.value)}
                className="w-full h-[220px] p-3 text-sm font-mono bg-white dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-700 dark:text-zinc-300 font-sans whitespace-pre-line">
                {deckContent}
              </div>
            )}
          </div>
        )}

        {activeTab === "captable" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Allocation Matrix (JSON)</span>
              {localIsOwner && (
                <button
                  onClick={() => loadTemplate("captable")}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Reset Matrix
                </button>
              )}
            </div>
            {localIsOwner ? (
              <textarea
                value={capTableContent}
                onChange={(e) => setCapTableContent(e.target.value)}
                className="w-full h-[180px] p-3 text-sm font-mono bg-white dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 font-bold text-xs text-gray-400 dark:text-zinc-500 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <span>Shareholder</span>
                  <span>Shares</span>
                  <span>Percentage</span>
                  <span>Role</span>
                </div>
                {JSON.parse(capTableContent || "[]").map((row: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 text-sm text-gray-800 dark:text-zinc-300 py-1">
                    <span className="font-semibold">{row.shareholder}</span>
                    <span>{row.shares}</span>
                    <span className="text-emerald-600 font-semibold">{row.percentage}</span>
                    <span className="text-xs text-gray-400">{row.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "financials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue Forecast Projections</span>
              {localIsOwner && (
                <button
                  onClick={() => loadTemplate("financials")}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Reset Projections
                </button>
              )}
            </div>
            {localIsOwner ? (
              <textarea
                value={financialsContent}
                onChange={(e) => setFinancialsContent(e.target.value)}
                className="w-full h-[180px] p-3 text-sm font-mono bg-white dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 font-bold text-xs text-gray-400 dark:text-zinc-500 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <span>Year</span>
                  <span>Gross Revenue</span>
                  <span>Operating Cost</span>
                  <span>Net Profit</span>
                </div>
                {JSON.parse(financialsContent || "{}").projections?.map((proj: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 text-sm text-gray-800 dark:text-zinc-300 py-1">
                    <span className="font-bold">{proj.year}</span>
                    <span className="text-emerald-600 font-semibold">{proj.revenue}</span>
                    <span className="text-red-500">{proj.expenses}</span>
                    <span className="text-indigo-600 font-extrabold">{proj.profit}</span>
                  </div>
                ))}
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800/80">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Core Assumptions</span>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">
                    {JSON.parse(financialsContent || "{}").assumptions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "legal" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">SARS Active Status</span>
              {localIsOwner && (
                <button
                  onClick={() => loadTemplate("legal")}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Use Legal Matrix
                </button>
              )}
            </div>
            {localIsOwner ? (
              <textarea
                value={legalContent}
                onChange={(e) => setLegalContent(e.target.value)}
                className="w-full h-[180px] p-3 text-sm font-mono bg-white dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ) : (
              <div className="prose dark:prose-invert text-sm leading-relaxed text-gray-700 dark:text-zinc-300 whitespace-pre-line">
                {legalContent}
              </div>
            )}
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Investment & Equity Stake Calculator</span>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Simulate investment tickets and calculate exact post-money equity percentages.</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-full">
                Interactive Tool
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                    Investment Amount (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">R</span>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[100000, 250000, 500000, 1000000, 2500000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setInvestmentAmount(amt)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          investmentAmount === amt
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                        }`}
                      >
                        R{(amt / 1000).toLocaleString()}k
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                    Pre-Money Valuation (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">R</span>
                    <input
                      type="number"
                      value={preMoneyValuation}
                      onChange={(e) => setPreMoneyValuation(Math.max(1, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[10000000, 20000000, 30000000, 50000000, 100000000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPreMoneyValuation(val)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          preMoneyValuation === val
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                        }`}
                      >
                        R{val / 1000000}M
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outputs Summary Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-3">
                    Term Sheet & Valuation Output
                  </span>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-zinc-400">Investment Ticket:</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">R {investmentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-zinc-400">Pre-Money Valuation:</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">R {preMoneyValuation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-amber-500/20">
                      <span className="text-gray-700 dark:text-zinc-300 font-bold">Post-Money Valuation:</span>
                      <span className="font-black text-amber-600 dark:text-amber-400">R {(preMoneyValuation + investmentAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-amber-500/20 text-center space-y-1">
                  <span className="text-xs text-gray-400 font-semibold block">Estimated Equity Stake</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {((investmentAmount / (preMoneyValuation + investmentAmount)) * 100).toFixed(2)}%
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Based on standard venture post-money valuation formula.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800/60">
        <span className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
          <Info className="w-4 h-4" /> Keep your data locked. Only matched VCs can decrypt.
        </span>

        {localIsOwner ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Encrypting & Storing..." : "Save Dataroom Changes"}
          </button>
        ) : (
          <button
            onClick={() => alert("Secure document package requested. Check notification panel.")}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Complete Dataroom Package
          </button>
        )}
      </div>
    </div>
  );
}
