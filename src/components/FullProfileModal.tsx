import React, { useState, useEffect } from "react";
import { Startup, getTractionSummary } from "../types";
import { X, Shield, ExternalLink, Mail, Phone, MapPin, Building, Globe, Award, Target, Users, Landmark, AlertCircle, Save, Share2, Linkedin, Calculator, TrendingUp, Download, Calendar, FileText, CheckCircle, Clock, Video } from "lucide-react";
import TeamDirectoryModal from "./TeamDirectoryModal";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface FullProfileModalProps {
  startup: Startup;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStartup: (updatedStartup: Startup) => void;
  currentUser?: any;
  onShare?: (startup: Startup) => void;
}

export default function FullProfileModal({
  startup,
  isOpen,
  onClose,
  onUpdateStartup,
  currentUser,
  onShare
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
  const [amountRaised, setAmountRaised] = useState(startup.amountRaised || "ZAR 0 raised");
  const [revenueStatus, setRevenueStatus] = useState(startup.revenueStatus || "Pre-revenue");
  const [mrr, setMrr] = useState(startup.mrr || "ZAR 0 MRR");
  const [productLinks, setProductLinks] = useState<string[]>(startup.productLinks || []);

  // Computed AI Score based on traction and revenue claims
  const aiScore = React.useMemo(() => {
    let base = 62;
    if (revenueStatus.toLowerCase().includes("revenue") || revenueStatus.toLowerCase().includes("generating") || revenueStatus.toLowerCase().includes("profitable") || revenueStatus.toLowerCase().includes("post")) {
      base += 18;
    }
    if (mrr && mrr !== "ZAR 0 MRR" && !mrr.toLowerCase().includes("0")) {
      base += 12;
    }
    if (traction.length > 40) base += 5;
    if (traction.toLowerCase().includes("pilot") || traction.toLowerCase().includes("user") || traction.toLowerCase().includes("customer") || traction.toLowerCase().includes("growth") || traction.toLowerCase().includes("revenue")) {
      base += 4;
    }
    return Math.min(99, base);
  }, [revenueStatus, mrr, traction]);

  // Investment Impact Calculator states
  const [calcInvestment, setCalcInvestment] = useState<number>(500000);
  const [calcValuation, setCalcValuation] = useState<number>(5000000);
  const postMoneyValuation = Math.max(1, calcValuation + calcInvestment);
  const equityDilutionPercent = Math.min(100, Math.max(0.1, (calcInvestment / postMoneyValuation) * 100)).toFixed(2);

  // Traction Growth Chart Data generator
  const parseNumericValue = (str?: string) => {
    if (!str) return 0;
    const lower = str.toLowerCase();
    const numMatch = lower.replace(/,/g, "").match(/[\d\.]+/);
    if (!numMatch) return 25000;
    let val = parseFloat(numMatch[0]);
    if (lower.includes("k") || lower.includes("thousand")) val *= 1000;
    if (lower.includes("m") || lower.includes("million")) val *= 1000000;
    return isNaN(val) ? 25000 : val;
  };

  const currentMetricVal = parseNumericValue(mrr) > 0 ? parseNumericValue(mrr) : parseNumericValue(amountRaised) > 0 ? parseNumericValue(amountRaised) / 10 : (startup.pitchScore || 80) * 1000;
  
  const tractionChartData = ["M-5", "M-4", "M-3", "M-2", "M-1", "Current"].map((month, idx) => {
    const factor = 0.45 + (idx * 0.11) + (Math.sin(idx) * 0.04);
    const val = Math.round(currentMetricVal * Math.min(1.0, Math.max(0.2, factor)));
    return {
      month,
      value: val,
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [showTeamDirectory, setShowTeamDirectory] = useState(false);
  const [meetingDate, setMeetingDate] = useState("2026-07-15");
  const [meetingTime, setMeetingTime] = useState("10:00");
  const [bookedMeeting, setBookedMeeting] = useState<{ date: string; time: string; link: string } | null>(null);

  const handleDownloadExecutiveSummary = () => {
    const dossierContent = `
==================================================
INVESTMENT COMMITTEE (IC) EXECUTIVE SUMMARY DOSSIER
==================================================
Company Name: ${companyName}
Website: ${website}
Country / Region: ${country}
Funding Stage: ${fundingStage}
Primary Contact: ${contactEmail} | ${phone}
Lead Founder: ${founderName}

---
1. PROBLEM STATEMENT:
${problem}

---
2. PRODUCT & ARCHITECTURE:
${description}

---
3. TRACTION & METRICS:
- Amount Raised: ${amountRaised}
- Revenue Status: ${revenueStatus}
- MRR: ${mrr}
- AI Evaluation Score: ${aiScore}/100
- Traction Details: ${traction}

---
4. TEAM & LEADERSHIP:
${team}

---
5. DEAL TERMS & VEHICLE:
${dealTerms}

==================================================
Generated via Makwa Africa DealRoom Platform
Confidential - For Investment Committee Review Only
==================================================
`;
    const blob = new Blob([dossierContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.replace(/[^a-z0-9]/gi, '_')}_Executive_Summary_IC_Dossier.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBookMeeting = () => {
    setBookedMeeting({
      date: meetingDate,
      time: meetingTime,
      link: `https://meet.jit.si/MakwaIC_${companyName.replace(/[^a-z0-9]/gi, '')}_${Date.now()}`
    });
  };

  const handleDownloadICS = () => {
    if (!bookedMeeting) return;
    const startDateTime = `${bookedMeeting.date.replace(/-/g, '')}T${bookedMeeting.time.replace(':', '')}00Z`;
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Makwa Africa//IC Meeting//EN
BEGIN:VEVENT
SUMMARY:Investment Committee Review: ${companyName}
DESCRIPTION:IC Review meeting with ${founderName} (${companyName}). Secure video link: ${bookedMeeting.link}
DTSTART:${startDateTime}
DTEND:${startDateTime.replace(/T(\d{2})(\d{2})/, (match, h, m) => `T${String(Number(h)+1).padStart(2,'0')}${m}`)}
LOCATION:Secure Video Call
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName.replace(/[^a-z0-9]/gi, '_')}_IC_Meeting.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getGoogleCalendarUrl = () => {
    if (!bookedMeeting) return "#";
    const text = encodeURIComponent(`Investment Committee Review: ${companyName}`);
    const details = encodeURIComponent(`IC Review meeting with ${founderName} (${companyName}). Secure video call link: ${bookedMeeting.link}`);
    const dates = `${bookedMeeting.date.replace(/-/g, '')}T${bookedMeeting.time.replace(':', '')}00Z/${bookedMeeting.date.replace(/-/g, '')}T${String(Number(bookedMeeting.time.slice(0,2))+1).padStart(2,'0')}${bookedMeeting.time.slice(3,5)}00Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${dates}`;
  };

  const [expandedFounder, setExpandedFounder] = useState<{
    name: string;
    role: string;
    photoUrl: string;
    companyName: string;
    email: string;
    phone?: string;
    bio: string;
    linkedin: string;
    twitter?: string;
    github?: string;
  } | null>(null);

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
    setAmountRaised(startup.amountRaised || "ZAR 0 raised");
    setRevenueStatus(startup.revenueStatus || "Pre-revenue");
    setMrr(startup.mrr || "ZAR 0 MRR");
    setProductLinks(startup.productLinks || []);
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
      dealTerms,
      amountRaised,
      revenueStatus,
      mrr,
      productLinks: productLinks.filter(l => l.trim() !== "")
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
            <button
              onClick={handleDownloadExecutiveSummary}
              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Download Executive Summary & Dataroom PDF Package for IC Review"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Exec Summary PDF</span>
            </button>

            {onShare && (
              <button
                onClick={() => onShare(startup)}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                title="Share Deal Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Deal</span>
              </button>
            )}

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
          
          {/* Company Logo & Founders Banner */}
          <div className="bg-[#161B22]/70 border border-[#30363D] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {startup.logoUrl && (
                <img
                  src={startup.logoUrl}
                  alt={companyName}
                  onClick={() => setExpandedImage({ url: startup.logoUrl!, title: `${companyName} - Brand Logo` })}
                  className="w-14 h-14 rounded-xl object-cover border border-[#30363D] shadow-md bg-[#0D1117] cursor-pointer hover:scale-105 transition hover:border-emerald-500 shrink-0"
                  title="Click to view larger logo"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold">Company Brand & Logo</p>
                <h3 className="text-base font-bold text-white">{companyName}</h3>
                <p className="text-xs text-emerald-400 font-medium">Click logo to enlarge</p>
              </div>
            </div>

            {/* Founders vertically one on top of the other, clickable to expand */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-bold">Founders & Leadership (Click to expand)</span>
              <div className="space-y-2">
                {startup.founderPhoto1 && (
                  <div
                    onClick={() => setExpandedFounder({
                      name: `${startup.firstName} ${startup.lastName}`,
                      role: "Founder & Chief Executive Officer",
                      photoUrl: startup.founderPhoto1!,
                      companyName: companyName,
                      email: startup.email,
                      phone: startup.phone,
                      bio: `${startup.firstName} ${startup.lastName} is the lead founder and visionary behind ${companyName}. With extensive experience in product strategy, engineering, and market execution, ${startup.firstName} leads the company's core mission to transform industry standards across ${startup.country}.`,
                      linkedin: `https://linkedin.com/in/${startup.firstName.toLowerCase()}-${startup.lastName.toLowerCase()}`,
                      twitter: `https://twitter.com/${startup.firstName.toLowerCase()}_${startup.lastName.toLowerCase()}`,
                      github: `https://github.com/${startup.firstName.toLowerCase()}`
                    })}
                    className="flex items-center gap-3 p-2 bg-[#0D1117] hover:bg-[#161B22] rounded-xl border border-[#30363D] cursor-pointer transition group"
                    title="Click to view founder bio, LinkedIn & socials"
                  >
                    <img
                      src={startup.founderPhoto1}
                      alt={`${startup.firstName} ${startup.lastName}`}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500/40 group-hover:border-emerald-400 shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                        {startup.firstName} {startup.lastName}
                      </p>
                      <p className="text-[10px] text-[#8B949E] truncate">Founder & CEO</p>
                    </div>
                  </div>
                )}

                {startup.founderPhoto2 && (
                  <div
                    onClick={() => setExpandedFounder({
                      name: "Co-Founder / Executive Lead",
                      role: "Chief Technology Officer & Co-Founder",
                      photoUrl: startup.founderPhoto2!,
                      companyName: companyName,
                      email: startup.email,
                      bio: `Co-founder and operational lead at ${companyName}. Bringing robust expertise in technical execution, partnership development, and ecosystem growth.`,
                      linkedin: `https://linkedin.com/in/cofounder-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                      twitter: `https://twitter.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}_lead`
                    })}
                    className="flex items-center gap-3 p-2 bg-[#0D1117] hover:bg-[#161B22] rounded-xl border border-[#30363D] cursor-pointer transition group"
                    title="Click to view founder bio, LinkedIn & socials"
                  >
                    <img
                      src={startup.founderPhoto2}
                      alt="Co-Founder"
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500/40 group-hover:border-emerald-400 shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                        Co-Founder / Executive
                      </p>
                      <p className="text-[10px] text-[#8B949E] truncate">{companyName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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

            {/* Product Link URLs / App URLs with ability to add more links */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Product Link URLs / App URLs
                </label>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setProductLinks([...productLinks, ""])}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>+ Add Product Link</span>
                  </button>
                )}
              </div>

              {isEditMode ? (
                <div className="space-y-2">
                  {productLinks.length === 0 ? (
                    <p className="text-xs text-[#8B949E] italic bg-[#161B22]/45 p-3 rounded-xl border border-[#30363D]">
                      No additional product links added yet. Click "+ Add Product Link" to add web app URLs, mobile app stores, or demos.
                    </p>
                  ) : (
                    productLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link}
                          onChange={(e) => {
                            const updated = [...productLinks];
                            updated[idx] = e.target.value;
                            setProductLinks(updated);
                          }}
                          className="flex-1 bg-[#161B22] border border-[#30363D] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs font-mono transition-all"
                          placeholder="https://app.example.com or Play Store / App Store link"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProductLinks(productLinks.filter((_, i) => i !== idx));
                          }}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {(!productLinks || productLinks.length === 0) ? (
                    <div className="bg-[#161B22]/45 border border-[#30363D] p-3 rounded-xl text-xs text-[#8B949E] italic">
                      No additional product URLs listed.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {productLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.startsWith("http") ? link : `https://${link}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="bg-[#161B22]/45 hover:bg-[#161B22] border border-[#30363D] p-3 rounded-xl text-emerald-400 hover:text-emerald-300 font-mono text-xs flex items-center justify-between gap-2 transition-all group"
                        >
                          <span className="truncate flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {link}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Traction */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Traction & Metrics
              </label>

              <div className="py-2 px-3 bg-[#161B22] border border-[#30363D] rounded-xl text-xs font-semibold text-emerald-400 font-mono tracking-wide">
                {getTractionSummary({ ...startup, amountRaised, revenueStatus, mrr })}
              </div>

              {/* Inline Pitch Refiner & AI Score Indicator */}
              <div className="bg-gradient-to-br from-emerald-950/30 via-[#161B22] to-indigo-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-3 my-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold text-xs">
                      🤖
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Pitch Refiner & Score Simulator</h4>
                      <p className="text-[10px] text-[#8B949E]">Real-time investor evaluation score based on traction & revenue claims</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#0D1117] border border-[#30363D] px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] text-[#8B949E] uppercase font-bold">AI Score:</span>
                    <span className={`text-sm font-black font-mono ${aiScore >= 90 ? "text-emerald-400" : aiScore >= 75 ? "text-indigo-400" : "text-amber-400"}`}>
                      {aiScore}/100
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#0D1117] rounded-full h-2 overflow-hidden border border-[#30363D]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      aiScore >= 90 ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" :
                      aiScore >= 75 ? "bg-gradient-to-r from-indigo-500 to-emerald-400" :
                      "bg-gradient-to-r from-amber-500 to-indigo-500"
                    }`}
                    style={{ width: `${aiScore}%` }}
                  />
                </div>

                {/* AI Real-time Tip */}
                <div className="bg-[#0D1117]/80 border border-[#30363D] rounded-xl p-3 text-xs text-[#C9D1D9] flex items-start gap-2.5">
                  <span className="text-emerald-400 text-sm shrink-0">💡</span>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-[11px]">AI Pitch Optimization Feedback:</p>
                    <p className="text-[11px] text-[#8B949E] leading-relaxed">
                      {aiScore >= 90
                        ? "Elite profile! Your traction and MRR claims reflect high investor readiness. Ready for syndicate distribution."
                        : aiScore >= 75
                        ? "Strong momentum detected. Highlight specific user retention or recurring contract data to push your score over 90."
                        : "Add specific customer pilots, active revenue figures, or signed letters of intent in your traction notes to boost your AI score."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Investment Impact Calculator Widget */}
              <div className="bg-gradient-to-br from-indigo-950/30 via-[#161B22] to-emerald-950/30 border border-indigo-500/30 rounded-2xl p-4 space-y-3.5 my-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-bold text-xs">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Investment Impact Calculator</h4>
                      <p className="text-[10px] text-[#8B949E]">Simulate potential equity dilution & post-money valuation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0D1117] border border-[#30363D] px-3 py-1 rounded-xl">
                    <span className="text-[10px] text-[#8B949E] uppercase font-bold">Dilution:</span>
                    <span className="text-xs font-black font-mono text-indigo-400">
                      {equityDilutionPercent}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">
                      Investment Amount (ZAR)
                    </label>
                    <input
                      type="number"
                      value={calcInvestment}
                      onChange={(e) => setCalcInvestment(Number(e.target.value) || 0)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      step={50000}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">
                      Pre-Money Valuation (ZAR)
                    </label>
                    <input
                      type="number"
                      value={calcValuation}
                      onChange={(e) => setCalcValuation(Number(e.target.value) || 0)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      step={500000}
                    />
                  </div>
                </div>

                {/* Calculation Summary Bar */}
                <div className="bg-[#0D1117]/90 border border-[#30363D] rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#8B949E] text-[10px] uppercase font-bold block">Post-Money Valuation</span>
                    <span className="text-white font-mono font-bold">ZAR {postMoneyValuation.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8B949E] text-[10px] uppercase font-bold block">Founder Stake Impact</span>
                    <span className="text-emerald-400 font-mono font-bold">{(100 - Number(equityDilutionPercent)).toFixed(2)}% remaining</span>
                  </div>
                </div>
              </div>

              {/* Traction History Line Chart Widget */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 space-y-3 my-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold text-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Traction & Growth History</h4>
                      <p className="text-[10px] text-[#8B949E]">Trailing 6-month growth trajectory derived from revenue & funding signals</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    +28.4% MoM
                  </span>
                </div>

                <div className="w-full h-44 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tractionChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                      <XAxis dataKey="month" stroke="#8B949E" fontSize={10} tickLine={false} />
                      <YAxis stroke="#8B949E" fontSize={10} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0D1117", borderColor: "#30363D", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                        formatter={(val: any) => [`ZAR ${Number(val).toLocaleString()}`, "Revenue / Traction"]}
                        labelStyle={{ color: "#8B949E", fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2.5} dot={{ fill: "#34D399", r: 3 }} activeDot={{ r: 6, fill: "#10B981" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {isEditMode ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Raised</label>
                      <input
                        type="text"
                        value={amountRaised}
                        onChange={(e) => setAmountRaised(e.target.value)}
                        className="w-full bg-[#161B22] border border-[#30363D] rounded-lg p-2 text-white text-xs font-mono"
                        placeholder="e.g. R750k raised"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Revenue Status</label>
                      <input
                        type="text"
                        value={revenueStatus}
                        onChange={(e) => setRevenueStatus(e.target.value)}
                        className="w-full bg-[#161B22] border border-[#30363D] rounded-lg p-2 text-white text-xs font-mono"
                        placeholder="e.g. Post-revenue"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">MRR / Revenue</label>
                      <input
                        type="text"
                        value={mrr}
                        onChange={(e) => setMrr(e.target.value)}
                        className="w-full bg-[#161B22] border border-[#30363D] rounded-lg p-2 text-white text-xs font-mono"
                        placeholder="e.g. ZAR 45k MRR"
                      />
                    </div>
                  </div>
                  <textarea
                    value={traction}
                    onChange={(e) => setTraction(e.target.value)}
                    className="w-full h-28 bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all font-sans"
                    placeholder="Summarize your key metrics, pilots, and organic growth..."
                  />
                </div>
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

            {/* Investment Committee Meeting Booking & Calendar Export */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-[#161B22] to-emerald-950/40 border border-indigo-500/30 rounded-2xl p-5 space-y-4 my-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Investment Committee (IC) Meeting Booking</h4>
                    <p className="text-[10px] text-[#8B949E]">Schedule review call with {founderName} and export calendar invite</p>
                  </div>
                </div>
              </div>

              {!bookedMeeting ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">
                        Meeting Date
                      </label>
                      <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1">
                        Time Slot (SAST)
                      </label>
                      <input
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#8B949E] italic">Includes automatic secure video room link.</span>
                    <button
                      type="button"
                      onClick={handleBookMeeting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Confirm & Book IC Meeting</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0D1117] border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">IC Meeting Successfully Booked!</span>
                    </div>
                    <button
                      onClick={() => setBookedMeeting(null)}
                      className="text-[10px] text-[#8B949E] hover:text-white underline cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#C9D1D9]">
                    <div className="bg-[#161B22] p-2.5 rounded-lg border border-[#30363D]">
                      <span className="text-[#8B949E] block text-[10px] uppercase font-bold">Scheduled Time</span>
                      <strong className="text-white font-mono">{bookedMeeting.date} at {bookedMeeting.time} SAST</strong>
                    </div>
                    <div className="bg-[#161B22] p-2.5 rounded-lg border border-[#30363D]">
                      <span className="text-[#8B949E] block text-[10px] uppercase font-bold">Secure Video Room</span>
                      <a href={bookedMeeting.link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-mono truncate block">
                        {bookedMeeting.link}
                      </a>
                    </div>
                  </div>

                  {/* Add to Google Calendar / Outlook ICS Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadICS}
                      className="w-full sm:flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .ics (Outlook / Apple)</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md text-center"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Add to Google Calendar</span>
                    </a>
                  </div>
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

      {/* Expanded Image Lightbox Modal */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center flex flex-col items-center"
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 p-2 text-[#8B949E] hover:text-white bg-[#0D1117] rounded-full border border-[#30363D] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 pr-8">{expandedImage.title}</h3>

            <div className="rounded-2xl overflow-hidden border border-[#30363D] shadow-2xl bg-[#0D1117] max-h-[70vh] flex items-center justify-center p-2">
              <img
                src={expandedImage.url}
                alt={expandedImage.title}
                className="max-h-[60vh] max-w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <button
              onClick={() => setExpandedImage(null)}
              className="mt-6 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm rounded-xl transition cursor-pointer"
            >
              Close View
            </button>
          </div>
        </div>
      )}

      {/* Expanded Founder Bio & Socials Modal */}
      {expandedFounder && (
        <div
          onClick={() => setExpandedFounder(null)}
          className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-left flex flex-col max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setExpandedFounder(null)}
              className="absolute top-4 right-4 p-2 text-[#8B949E] hover:text-white bg-[#0D1117] rounded-full border border-[#30363D] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5 pr-10">
              <img
                src={expandedFounder.photoUrl}
                alt={expandedFounder.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl bg-[#0D1117] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{expandedFounder.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">Verified</span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold">{expandedFounder.role}</p>
                <p className="text-xs text-[#8B949E]">At {expandedFounder.companyName}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#C9D1D9]">
              <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Professional Bio & Vision
                </h4>
                <p className="text-sm leading-relaxed text-white">{expandedFounder.bio}</p>
              </div>

              <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-3">
                  Social & Professional Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={expandedFounder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group"
                  >
                    <Linkedin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate flex-1">LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-white" />
                  </a>

                  {expandedFounder.twitter && (
                    <a
                      href={expandedFounder.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group"
                    >
                      <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate flex-1">Twitter / X</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-white" />
                    </a>
                  )}

                  <a
                    href={`mailto:${expandedFounder.email}`}
                    className="flex items-center gap-2.5 p-2.5 bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group sm:col-span-2"
                  >
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate flex-1">{expandedFounder.email}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Direct Email</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowTeamDirectory(true);
                    setExpandedFounder(null);
                  }}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>View Full Founder Bio & Team Page</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpandedFounder(null)}
                  className="py-3 px-5 bg-[#0D1117] hover:bg-[#1F242C] text-white border border-[#30363D] font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Directory Modal */}
      {showTeamDirectory && (
        <TeamDirectoryModal
          startup={startup}
          initialFounderName={expandedFounder?.name}
          onClose={() => setShowTeamDirectory(false)}
        />
      )}
    </div>
  );
}
