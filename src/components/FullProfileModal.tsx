import React, { useState, useEffect } from "react";
import { Startup } from "../types";
import { X, Shield, ExternalLink, Mail, Phone, MapPin, Building, Globe, Award, Target, Users, Landmark, AlertCircle, Save } from "lucide-react";

interface FullProfileModalProps {
  startup: Startup;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStartup: (updatedStartup: Startup) => void;
  currentUser?: any;
}

export default function FullProfileModal({
  startup,
  isOpen,
  onClose,
  onUpdateStartup,
  currentUser
}: FullProfileModalProps) {
  // If not open, render nothing
  if (!isOpen) return null;

  // Track if the current user is considered the owner (founder).
  // We can also allow toggling view/edit simulation so guests can fully experience it!
  const [isEditMode, setIsEditMode] = useState(currentUser?.role === "startup" || !currentUser);

  // Form states initialized with startup data
  const [companyName, setCompanyName] = useState(startup.companyName || "");
  const [website, setWebsite] = useState(startup.website || "");
  const [country, setCountry] = useState(startup.country || "");
  const [fundingStage, setFundingStage] = useState(startup.fundingStage || "");
  const [contactEmail, setContactEmail] = useState(startup.email || "");
  const [phone, setPhone] = useState(startup.phone || "");
  const [problem, setProblem] = useState(startup.problem || "");
  const [description, setDescription] = useState(startup.description || "");
  const [traction, setTraction] = useState(startup.traction || "");
  const [team, setTeam] = useState(startup.team || "");
  const [dealTerms, setDealTerms] = useState(startup.dealTerms || "");

  const [isSaving, setIsSaving] = useState(false);

  // Sync state if startup changes
  useEffect(() => {
    setCompanyName(startup.companyName || "");
    setWebsite(startup.website || "");
    setCountry(startup.country || "");
    setFundingStage(startup.fundingStage || "");
    setContactEmail(startup.email || "");
    setPhone(startup.phone || "");
    setProblem(startup.problem || "");
    setDescription(startup.description || "");
    setTraction(startup.traction || "");
    setTeam(startup.team || "");
    setDealTerms(startup.dealTerms || "");
  }, [startup]);

  const handleSave = () => {
    setIsSaving(true);
    const updated: Startup = {
      ...startup,
      companyName,
      website,
      country,
      fundingStage,
      email: contactEmail,
      phone,
      problem,
      description,
      traction,
      team,
      dealTerms
    };

    setTimeout(() => {
      onUpdateStartup(updated);
      setIsSaving(false);
      // Optional: close or show success
      alert("Startup profile updated successfully!");
    }, 600);
  };

  const founderName = `${startup.firstName} ${startup.lastName}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D1117]/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Outer container */}
      <div 
        className="relative bg-[#0D1117] border border-[#30363D] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Block */}
        <div className="p-6 border-b border-[#30363D] bg-gradient-to-r from-emerald-950/20 via-[#161B22] to-amber-950/20 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              Startup Portal
            </h1>
            <p className="text-xs text-[#8B949E]">
              Founders: sign in with your company to keep your deal profile fresh.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center hover:bg-[#161B22] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Authentication / Status Strip */}
        <div className="bg-[#161B22] border-b border-[#30363D] px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#C9D1D9] font-bold">
              {companyName || "VIB3, Inc."}
            </span>
            <span className="text-[#8B949E]">•</span>
            <span className="text-[#8B949E]">
              Signed in as <strong className="text-white">{founderName || "Francois Lategan"}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Simulation mode switch */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-2.5 py-1 bg-[#30363D]/60 hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] hover:text-white font-bold rounded-lg transition-all cursor-pointer"
            >
              {isEditMode ? "Switch to View Mode" : "Switch to Edit Mode"}
            </button>

            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#C9D1D9]">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161B22]/60 border border-[#30363D] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold">Funding Stage</p>
                <p className="text-sm font-black text-white">{fundingStage || "Pre-Seed"}</p>
              </div>
            </div>

            <div className="bg-[#161B22]/60 border border-[#30363D] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold">Origin / Location</p>
                <p className="text-sm font-black text-white">{country || "South Africa"}</p>
              </div>
            </div>

            <div className="bg-[#161B22]/60 border border-[#30363D] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold">Deal Status</p>
                <p className="text-sm font-black text-white">Active (Vetted)</p>
              </div>
            </div>
          </div>

          {/* Form / Profile Fields */}
          <div className="space-y-6">
            
            {/* Row 1: Company Name & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  Company Name
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="Enter company name..."
                  />
                ) : (
                  <div className="bg-[#161B22]/45 border border-[#30363D] px-3.5 py-2.5 rounded-xl text-white font-bold text-sm">
                    {companyName}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Website
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="https://example.com"
                  />
                ) : (
                  <a
                    href={website}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="bg-[#161B22]/45 hover:bg-[#161B22] border border-[#30363D] px-3.5 py-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 font-bold text-sm flex items-center justify-between transition-all"
                  >
                    <span>{website}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {/* Row 2: Country / Region & Funding Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Country / Region
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="e.g. Pretoria/Cape Town, South Africa"
                  />
                ) : (
                  <div className="bg-[#161B22]/45 border border-[#30363D] px-3.5 py-2.5 rounded-xl text-white font-semibold text-sm">
                    {country}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                  Funding Stage
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={fundingStage}
                    onChange={(e) => setFundingStage(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="e.g. Pre-Seed"
                  />
                ) : (
                  <div className="bg-[#161B22]/45 border border-[#30363D] px-3.5 py-2.5 rounded-xl text-white font-bold text-sm">
                    {fundingStage}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Contact Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Contact Email
                </label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="email@company.com"
                  />
                ) : (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="bg-[#161B22]/45 hover:bg-[#161B22] border border-[#30363D] px-3.5 py-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 font-mono text-sm flex items-center justify-between transition-all"
                  >
                    <span>{contactEmail}</span>
                    <Mail className="w-3.5 h-3.5 text-[#8B949E]" />
                  </a>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Phone
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="+27..."
                  />
                ) : (
                  <div className="bg-[#161B22]/45 border border-[#30363D] px-3.5 py-2.5 rounded-xl text-white font-mono text-sm">
                    {phone}
                  </div>
                )}
              </div>
            </div>

            {/* Problem you're solving */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                Problem you're solving
              </label>
              {isEditMode ? (
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full h-24 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  placeholder="Describe the problem in detail..."
                />
              ) : (
                <div className="bg-[#161B22]/45 border border-[#30363D] p-4 rounded-xl leading-relaxed text-[#C9D1D9] text-sm whitespace-pre-wrap">
                  {problem}
                </div>
              )}
            </div>

            {/* Product description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Product description
              </label>
              {isEditMode ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-28 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  placeholder="Describe your product architecture and services..."
                />
              ) : (
                <div className="bg-[#161B22]/45 border border-[#30363D] p-4 rounded-xl leading-relaxed text-[#C9D1D9] text-sm whitespace-pre-wrap">
                  {description}
                </div>
              )}
            </div>

            {/* Traction */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Traction
              </label>
              {isEditMode ? (
                <textarea
                  value={traction}
                  onChange={(e) => setTraction(e.target.value)}
                  className="w-full h-32 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all font-sans"
                  placeholder="Summarize your key metrics, pilots, and organic growth..."
                />
              ) : (
                <div className="bg-[#161B22]/45 border border-[#30363D] p-4 rounded-xl leading-relaxed text-[#C9D1D9] text-sm whitespace-pre-wrap">
                  {traction}
                </div>
              )}
            </div>

            {/* Team */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Team
              </label>
              {isEditMode ? (
                <textarea
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full h-28 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  placeholder="Core team members, founders, and key additions..."
                />
              ) : (
                <div className="bg-[#161B22]/45 border border-[#30363D] p-4 rounded-xl leading-relaxed text-[#C9D1D9] text-sm whitespace-pre-wrap">
                  {team}
                </div>
              )}
            </div>

            {/* Deal Terms */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-amber-500" />
                Deal Terms
              </label>
              {isEditMode ? (
                <textarea
                  value={dealTerms}
                  onChange={(e) => setDealTerms(e.target.value)}
                  className="w-full h-28 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  placeholder="Fundraising details, vehicle, pre-money valuation..."
                />
              ) : (
                <div className="bg-[#161B22]/45 border border-[#30363D] p-4 rounded-xl leading-relaxed text-[#C9D1D9] text-sm whitespace-pre-wrap">
                  {dealTerms}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer Area with Action Controls */}
        <div className="p-6 border-t border-[#30363D] bg-[#161B22] flex items-center justify-between">
          <span className="text-xs text-[#8B949E] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            GDPR Safe • Secure data storage and retrieval.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#30363D] text-[#C9D1D9] hover:text-white hover:bg-[#30363D]/60 transition-all text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            {isEditMode && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save profile"}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
