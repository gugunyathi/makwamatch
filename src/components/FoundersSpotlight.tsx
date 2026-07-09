import React from "react";
import { Startup } from "../types";
import { Sparkles, MessageSquare, ExternalLink, Award, Heart, User, MapPin } from "lucide-react";

interface FoundersSpotlightProps {
  startups: Startup[];
  onSelectStartup: (startup: Startup) => void;
  onStartChat: (startup: Startup) => void;
  onOpenFullProfile: (startup: Startup) => void;
}

export default function FoundersSpotlight({
  startups,
  onSelectStartup,
  onStartChat,
  onOpenFullProfile
}: FoundersSpotlightProps) {
  if (!startups || startups.length === 0) return null;

  // Deterministic daily pick based on YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const dailyIndex = Math.abs(hash) % startups.length;
  const featuredStartup = startups[dailyIndex];

  // Rotate others or show all startups in horizontal scroll
  return (
    <div className="w-full max-w-3xl mx-auto mb-3 bg-[#0D1117] border border-[#30363D] rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Founders' Spotlight</h3>
            <p className="text-[10px] text-[#8B949E]">Human connection & daily featured builders</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Daily Feature Active</span>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-3.5 pb-2 scrollbar-thin scrollbar-thumb-[#30363D] scrollbar-track-transparent">
        {startups.map((s, idx) => {
          const isFeaturedToday = s.id === featuredStartup.id;
          const founderPhoto = s.founderPhoto1 || s.logoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

          return (
            <div
              key={s.id}
              className={`shrink-0 w-72 rounded-xl p-3.5 border transition-all flex flex-col justify-between relative group ${
                isFeaturedToday
                  ? "bg-gradient-to-br from-[#161B22] to-[#1f2937] border-amber-500/50 shadow-lg shadow-amber-500/5"
                  : "bg-[#161B22] border-[#30363D] hover:border-[#8B949E]/50"
              }`}
            >
              {isFeaturedToday && (
                <div className="absolute -top-2.5 right-3 bg-amber-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" /> Founder of the Day
                </div>
              )}

              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={founderPhoto}
                    alt={`${s.firstName} ${s.lastName}`}
                    className="w-12 h-12 rounded-xl object-cover border border-[#30363D] shadow-inner shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">
                      {s.firstName} {s.lastName}
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-400 truncate">
                      {s.companyName}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#8B949E] mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{s.country}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#C9D1D9] mt-2.5 line-clamp-2 leading-relaxed italic">
                  "{s.problem}"
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#30363D]/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenFullProfile(s)}
                  className="flex-1 py-1.5 px-2 bg-[#21262D] hover:bg-[#30363D] text-white text-[11px] font-semibold rounded-lg transition text-center truncate cursor-pointer border border-[#30363D]"
                >
                  View Story
                </button>
                <button
                  onClick={() => onStartChat(s)}
                  className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-emerald-500/30 cursor-pointer"
                  title="Message Founder"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
