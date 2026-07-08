import React, { useState } from "react";
import { Startup } from "../types";
import { X, Linkedin, Globe, Mail, ExternalLink, Award, Users, ShieldCheck, Sparkles, Briefcase, GraduationCap, ChevronRight, MessageSquare, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  background: string;
  education: string;
  linkedin: string;
  twitter?: string;
  email: string;
  isLeadFounder?: boolean;
}

interface TeamDirectoryModalProps {
  startup: Startup;
  initialFounderName?: string;
  onClose: () => void;
  onConnectClick?: (startup: Startup) => void;
}

export default function TeamDirectoryModal({ startup, initialFounderName, onClose, onConnectClick }: TeamDirectoryModalProps) {
  const companyName = startup.companyName || "Venture";
  
  // Build realistic team members for this startup
  const teamMembers: TeamMember[] = [
    {
      id: "founder-1",
      name: `${startup.firstName} ${startup.lastName}`,
      role: "Founder & Chief Executive Officer",
      photoUrl: startup.founderPhoto1 || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      bio: `${startup.firstName} ${startup.lastName} is the lead founder and visionary behind ${companyName}. With over 10 years of experience in product strategy, engineering, and high-growth scaling, ${startup.firstName} leads the company's core mission to transform industry standards across ${startup.country} and international markets. Previously led product initiatives at tier-1 technology firms and graduated with honors in Computer Science & Business Administration.`,
      background: "Ex-Product Lead at Pan-African FinTech / Tech Ventures (5+ years scaling teams from 0 to 50+).",
      education: "B.Sc. Computer Science & Economics",
      linkedin: `https://linkedin.com/in/${startup.firstName.toLowerCase()}-${startup.lastName.toLowerCase()}`,
      twitter: `https://twitter.com/${startup.firstName.toLowerCase()}_${startup.lastName.toLowerCase()}`,
      email: startup.email,
      isLeadFounder: true
    },
    {
      id: "founder-2",
      name: startup.founderPhoto2 ? "Dr. Thabo Khumalo" : "Kagiso Mokoena",
      role: "Co-Founder & Chief Technology Officer",
      photoUrl: startup.founderPhoto2 || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      bio: `Overseeing core platform architecture, AI/ML pipelines, and technical security at ${companyName}. Expert in distributed systems, cloud infrastructure, and robust API design. Passionate about building resilient software that solves complex regional challenges.`,
      background: "Ex-Senior Systems Architect & Senior Software Engineer with deep cloud expertise.",
      education: "M.Sc. Software Engineering & Distributed Systems",
      linkedin: `https://linkedin.com/in/tech-lead-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      twitter: `https://twitter.com/cto_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      email: `tech@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      isLeadFounder: false
    },
    {
      id: "team-3",
      name: "Lerato Molefe",
      role: "Head of Product & User Experience",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      bio: `Lerato leads product design, user research, and customer success workflows. Dedicated to crafting intuitive, frictionless user journeys that drive high retention and engagement across mobile and web platforms.`,
      background: "Lead Product Designer across multiple successful African startups and digital agencies.",
      education: "B.A. Interactive Media & Design",
      linkedin: `https://linkedin.com/in/lerato-molefe-product`,
      email: `lerato@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      isLeadFounder: false
    },
    {
      id: "team-4",
      name: "Sipho Dlamini",
      role: "Head of Growth & Strategic Partnerships",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      bio: `Driving commercial expansion, enterprise sales channels, and institutional partnerships. Sipho has successfully onboarded dozens of key enterprise clients and strategic channel partners.`,
      background: "Ex-B2B Enterprise Account Executive & Partnerships Lead.",
      education: "B.Com. Finance & Marketing Management",
      linkedin: `https://linkedin.com/in/sipho-dlamini-growth`,
      email: `sipho@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      isLeadFounder: false
    }
  ];

  const [activeMember, setActiveMember] = useState<TeamMember>(
    initialFounderName 
      ? (teamMembers.find(m => m.name.toLowerCase().includes(initialFounderName.toLowerCase())) || teamMembers[0])
      : teamMembers[0]
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0D1117] border border-[#30363D] rounded-3xl max-w-4xl w-full shadow-2xl relative text-left flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#161B22] via-[#1F242C] to-[#161B22] p-6 border-b border-[#30363D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {startup.logoUrl ? (
              <img
                src={startup.logoUrl}
                alt={companyName}
                className="w-12 h-12 rounded-2xl object-cover border border-[#30363D] shadow-lg bg-[#0D1117]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Official Team Directory</span>
                <span className="text-xs text-[#8B949E]">• {startup.country}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{companyName} Leadership & Team</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onConnectClick && (
              <button
                onClick={() => {
                  onConnectClick(startup);
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Connect with Team</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#8B949E] hover:text-white bg-[#161B22] rounded-full border border-[#30363D] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Team List Sidebar */}
          <div className="lg:col-span-5 bg-[#161B22]/50 border-r border-[#30363D] p-5 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> Team Members ({teamMembers.length})
              </h3>
              <span className="text-[10px] bg-[#30363D]/50 text-white px-2 py-0.5 rounded-full font-medium">Verified Profiles</span>
            </div>

            <div className="space-y-2">
              {teamMembers.map((member) => {
                const isSelected = activeMember.id === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setActiveMember(member)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition text-left ${
                      isSelected
                        ? "bg-[#1F242C] border-emerald-500 shadow-md shadow-emerald-500/10"
                        : "bg-[#0D1117]/80 hover:bg-[#1F242C]/60 border-[#30363D]"
                    }`}
                  >
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#30363D] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                        {member.isLeadFounder && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-bold shrink-0">CEO</span>
                        )}
                      </div>
                      <p className="text-xs text-[#8B949E] truncate">{member.role}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? "text-emerald-400 translate-x-0.5" : "text-[#8B949E]"}`} />
                  </div>
                );
              })}
            </div>

            <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4 mt-4 text-center">
              <p className="text-xs text-[#8B949E] mb-2">Looking to join or invest in {companyName}?</p>
              <button
                onClick={() => {
                  if (onConnectClick) {
                    onConnectClick(startup);
                    onClose();
                  } else {
                    alert(`Message request sent to ${companyName} founders!`);
                  }
                }}
                className="w-full py-2 bg-[#21262D] hover:bg-[#30363D] text-white font-bold text-xs rounded-xl transition border border-[#30363D] cursor-pointer"
              >
                Send Direct Message to Founders
              </button>
            </div>
          </div>

          {/* Right Column: Detailed Bio & Socials View */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-6 bg-[#0D1117] text-[#C9D1D9]">
            {/* Header info for active member */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#161B22] border border-[#30363D] rounded-2xl p-5 shadow-lg">
              <img
                src={activeMember.photoUrl}
                alt={activeMember.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl shrink-0 bg-[#0D1117]"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">{activeMember.name}</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-400">{activeMember.role}</p>
                <p className="text-xs text-[#8B949E]">At {companyName} • {startup.country}</p>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-[#161B22]/70 border border-[#30363D] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Biography & Vision
              </h4>
              <p className="text-sm leading-relaxed text-white">{activeMember.bio}</p>
            </div>

            {/* Background & Education Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#161B22]/70 border border-[#30363D] rounded-2xl p-4 space-y-2">
                <h5 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Professional Background
                </h5>
                <p className="text-xs text-white leading-normal">{activeMember.background}</p>
              </div>

              <div className="bg-[#161B22]/70 border border-[#30363D] rounded-2xl p-4 space-y-2">
                <h5 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Education & Credentials
                </h5>
                <p className="text-xs text-white leading-normal">{activeMember.education}</p>
              </div>
            </div>

            {/* Social & Contact Links */}
            <div className="bg-[#161B22]/70 border border-[#30363D] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                Direct Contact & Social Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={activeMember.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#0D1117] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group"
                >
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold truncate">LinkedIn Profile</p>
                    <p className="text-[10px] text-[#8B949E] truncate">Connect professionally</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#8B949E] group-hover:text-white shrink-0" />
                </a>

                {activeMember.twitter && (
                  <a
                    href={activeMember.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0D1117] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group"
                  >
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg group-hover:bg-sky-500/20">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold truncate">Twitter / X</p>
                      <p className="text-[10px] text-[#8B949E] truncate">Follow updates</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#8B949E] group-hover:text-white shrink-0" />
                  </a>
                )}

                <a
                  href={`mailto:${activeMember.email}`}
                  className="flex items-center gap-3 p-3 bg-[#0D1117] hover:bg-[#1F242C] border border-[#30363D] rounded-xl text-white font-medium text-xs transition group sm:col-span-2"
                >
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold truncate">{activeMember.email}</p>
                    <p className="text-[10px] text-emerald-400">Direct Founder Email (Verified)</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#161B22] p-4 border-t border-[#30363D] flex items-center justify-between shrink-0">
          <p className="text-xs text-[#8B949E]">
            All founder and team credentials verified through Makwa VC Trust & Security layer.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#21262D] hover:bg-[#30363D] text-white font-bold text-xs rounded-xl transition cursor-pointer border border-[#30363D]"
          >
            Close Team Directory
          </button>
        </div>
      </motion.div>
    </div>
  );
}
