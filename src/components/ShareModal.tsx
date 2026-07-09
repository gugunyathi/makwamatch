import React, { useState } from "react";
import { Startup } from "../types";
import { Share2, Copy, Check, ExternalLink, QrCode, Mail, Globe, Send, X } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  startup?: Startup | null;
  appUrl?: string;
  title?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  startup,
  appUrl,
  title
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = startup
    ? `${window.location.origin}${window.location.pathname}?startupId=${startup.id}`
    : (appUrl || `${window.location.origin}${window.location.pathname}`);

  const shareTitle = startup
    ? `Check out ${startup.companyName} on Makwa Match (${startup.category || startup.fundingStage})`
    : "Makwa Match - Elite Venture Deal Flow & Co-Investment Platform";

  const shareText = startup
    ? `${startup.companyName}: ${startup.problem.slice(0, 80)}... Terms: ${startup.dealTerms}`
    : "Discover vetted early-stage startups, connect directly with founders, and co-invest seamlessly.";

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(targetUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      prompt("Copy link:", targetUrl);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: targetUrl,
        });
      } catch (err) {
        // cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {title || (startup ? `Share ${startup.companyName}` : "Share Makwa Match")}
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                {startup ? "Direct secure link & co-investor invite" : "Platform invitation link"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Card Preview if Startup */}
          {startup && (
            <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-3.5 flex items-center gap-3.5 shadow-inner">
              <img
                src={startup.logoUrl || startup.founderPhoto1 || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"}
                alt={startup.companyName}
                className="w-12 h-12 rounded-xl object-cover border border-[#30363D]"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{startup.companyName}</h4>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold">
                    {startup.category || startup.fundingStage}
                  </span>
                </div>
                <p className="text-[11px] text-[#8B949E] truncate mt-0.5">{startup.problem}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                  <span>Stage: {startup.fundingStage}</span>
                  <span>•</span>
                  <span>Terms: {startup.dealTerms}</span>
                </div>
              </div>
            </div>
          )}

          {/* Link box */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#8B949E] font-bold uppercase tracking-wider block">Secure Share URL</label>
            <div className="flex items-center gap-2 bg-[#0D1117] border border-[#30363D] rounded-xl p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="bg-transparent text-xs text-white font-mono flex-1 focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  copied
                    ? "bg-emerald-500 text-black"
                    : "bg-[#21262D] hover:bg-[#30363D] text-white border border-[#30363D]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Social & Messaging Share Buttons */}
          <div className="space-y-2">
            <label className="text-[10px] text-[#8B949E] font-bold uppercase tracking-wider block">Share to Channels</label>
            <div className="grid grid-cols-4 gap-2">
              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle + " - " + targetUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D] hover:border-emerald-500/50 hover:bg-[#21262D] transition group cursor-pointer text-center"
              >
                <span className="text-white text-xs font-bold group-hover:text-emerald-400">𝕏 / Twitter</span>
                <span className="text-[9px] text-[#8B949E] mt-0.5">Tweet deal</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D] hover:border-emerald-500/50 hover:bg-[#21262D] transition group cursor-pointer text-center"
              >
                <span className="text-blue-400 text-xs font-bold group-hover:scale-105 transition-transform">LinkedIn</span>
                <span className="text-[9px] text-[#8B949E] mt-0.5">Network</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + targetUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D] hover:border-emerald-500/50 hover:bg-[#21262D] transition group cursor-pointer text-center"
              >
                <span className="text-emerald-400 text-xs font-bold group-hover:scale-105 transition-transform">WhatsApp</span>
                <span className="text-[9px] text-[#8B949E] mt-0.5">Chat</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + targetUrl)}`}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D] hover:border-emerald-500/50 hover:bg-[#21262D] transition group cursor-pointer text-center"
              >
                <span className="text-amber-400 text-xs font-bold group-hover:scale-105 transition-transform">Email</span>
                <span className="text-[9px] text-[#8B949E] mt-0.5">Send memo</span>
              </a>
            </div>
          </div>

          {/* Native Web Share Button if available */}
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Use Device Share Sheet...</span>
            </button>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between">
          <span className="text-[10px] text-[#8B949E]">
            🔒 Secure encrypted deal flow token
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
