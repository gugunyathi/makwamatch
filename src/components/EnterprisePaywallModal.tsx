import React, { useState } from "react";
import { Shield, Sparkles, Building, Landmark, Check, Copy, X, Lock, Mail, Key, Phone, ArrowRight } from "lucide-react";

interface VerifyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, domain: string) => void;
  defaultDomain: string;
}

export function VerifyCodeModal({ isOpen, onClose, onVerify, defaultDomain }: VerifyCodeModalProps) {
  const [code, setCode] = useState("");
  const [domain, setDomain] = useState(defaultDomain);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your Enterprise Unlock Code.");
      return;
    }
    if (!domain.trim()) {
      setError("Please enter your organization email domain.");
      return;
    }

    const validCodes = ["SIGNAL-2026-ENT", "SIGNALDESK10X", "ENT-2026-VIP", "SIGNAL-DESK-VIP"];
    const upperCode = code.trim().toUpperCase();

    if (validCodes.includes(upperCode) || upperCode.length >= 4) {
      onVerify(upperCode, domain.trim().toLowerCase());
    } else {
      setError("Invalid unlock code. Please contact thami@signaldesk.co.za or gugu@signaldesk.co.za for a valid code.");
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#161B22] border border-emerald-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Key className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Unlock Code Verification</h3>
          </div>
          <button onClick={onClose} className="text-[#8B949E] hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <p className="text-xs text-[#C9D1D9] leading-relaxed">
            Enter the official unlock code received from <a href="mailto:thami@signaldesk.co.za" className="text-emerald-400 underline">thami@signaldesk.co.za</a> or <a href="mailto:gugu@signaldesk.co.za" className="text-emerald-400 underline">gugu@signaldesk.co.za</a> after your ZAR 50,000 EFT payment.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#8B949E] font-bold uppercase tracking-wider block">Organization Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. mycompany.co.za"
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Unlock Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }}
              placeholder="e.g. SIGNAL-2026-ENT"
              className="w-full bg-[#0D1117] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-emerald-400 uppercase"
              autoFocus
            />
            <span className="text-[10px] text-[#8B949E] block">Grants instant 10-user team access for @{domain}</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#21262D] text-white text-xs font-bold rounded-xl hover:bg-[#30363D] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-extrabold rounded-xl transition cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <span>Verify & Unlock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EnterprisePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateLicense: (domain: string, code?: string) => void;
  userEmail?: string;
}

export default function EnterprisePaywallModal({
  isOpen,
  onClose,
  onActivateLicense,
  userEmail
}: EnterprisePaywallModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [orgDomain, setOrgDomain] = useState(() => {
    if (userEmail && userEmail.includes("@")) {
      return userEmail.split("@")[1].toLowerCase();
    }
    return "mycompany.co.za";
  });

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateEFT = () => {
    if (!orgDomain.trim()) {
      alert("Please enter a valid organization email domain.");
      return;
    }
    onActivateLicense(orgDomain.trim().toLowerCase(), "SIMULATED-EFT");
  };

  const handleCodeVerified = (code: string, domain: string) => {
    setIsVerifyModalOpen(false);
    onActivateLicense(domain, code);
  };

  const mailtoSubject = encodeURIComponent("Proof of Payment - ZAR 50,000 Enterprise Annual License");
  const mailtoBody = encodeURIComponent(`Hi Thami & Gugu,\n\nPlease find attached our proof of payment for the ZAR 50,000 Enterprise Annual License.\n\nOrganization Domain: @${orgDomain}\nContact Email: ${userEmail || "user@mycompany.co.za"}\n\nKindly send us our 10-user Enterprise Unlock Code.\n\nThank you!`);
  const mailtoLink = `mailto:thami@signaldesk.co.za,gugu@signaldesk.co.za?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
          
          <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Enterprise Annual License Paywall</h3>
                <p className="text-[11px] text-[#8B949E]">Unlock all 55+ venture deals & full database (10 team seats)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#161B22] border border-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            <div className="bg-gradient-to-br from-emerald-500/10 via-[#0D1117] to-amber-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-emerald-500 text-black text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise Annual Pass
              </div>
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold">Signal Desk Enterprise License</span>
              <div className="text-3xl font-extrabold text-white">
                ZAR 50,000 <span className="text-xs font-normal text-[#8B949E]">/ year</span>
              </div>
              <p className="text-xs text-[#C9D1D9] max-w-lg mx-auto leading-relaxed">
                Full unlimited access for your entire organization. Automatically covers up to 10 colleagues sharing email domain <span className="text-emerald-400 font-mono">@{orgDomain}</span>.
              </p>
            </div>

            <div className="bg-[#0D1117] border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Landmark className="w-4 h-4" /> Proof of Payment & Bank EFT Details
                </div>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Signal Desk Pty Ltd
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#161B22] p-3 rounded-xl border border-[#30363D] flex justify-between items-center">
                  <div>
                    <span className="text-[#8B949E] block text-[9px] uppercase">Company Name</span>
                    <span className="text-white font-bold">Signal Desk Pty Ltd</span>
                  </div>
                  <button onClick={() => handleCopy("Signal Desk Pty Ltd", "company")} className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer">
                    {copiedField === "company" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "company" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="bg-[#161B22] p-3 rounded-xl border border-[#30363D] flex justify-between items-center">
                  <div>
                    <span className="text-[#8B949E] block text-[9px] uppercase">Company Registration</span>
                    <span className="text-white font-bold">2026/346461/07</span>
                  </div>
                  <button onClick={() => handleCopy("2026/346461/07", "reg")} className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer">
                    {copiedField === "reg" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "reg" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="bg-[#161B22] p-3 rounded-xl border border-[#30363D]">
                  <span className="text-[#8B949E] block text-[9px] uppercase">Bank / Branch Code</span>
                  <span className="text-white font-bold">Nedbank (198765)</span>
                </div>

                <div className="bg-[#161B22] p-3 rounded-xl border border-[#30363D] flex justify-between items-center">
                  <div>
                    <span className="text-[#8B949E] block text-[9px] uppercase">Account Number</span>
                    <span className="text-white font-bold text-sm tracking-wider">1342081226</span>
                  </div>
                  <button onClick={() => handleCopy("1342081226", "acc")} className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 cursor-pointer">
                    {copiedField === "acc" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "acc" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Mail className="w-4 h-4" /> Send Proof of Payment to Signal Desk Team
                </div>
                <p className="text-[11px] text-[#C9D1D9] leading-relaxed">
                  After completing the ZAR 50,000 EFT payment, please email your proof of payment confirmation to both <a href="mailto:thami@signaldesk.co.za" className="text-emerald-400 font-bold font-mono underline hover:text-emerald-300">thami@signaldesk.co.za</a> and <a href="mailto:gugu@signaldesk.co.za" className="text-emerald-400 font-bold font-mono underline hover:text-emerald-300">gugu@signaldesk.co.za</a>.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#30363D]/60">
                  <div className="flex items-center gap-1.5 text-xs text-[#8B949E]">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thami's Contact: <a href="tel:+27782459205" className="text-white font-mono font-bold hover:underline">+27 78 245 9205</a></span>
                  </div>
                  <a
                    href={mailtoLink}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email POP Now (Draft Email)</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#8B949E] font-bold uppercase tracking-wider block">
                  Your Organization Domain (Auto-detected from Login)
                </label>
                <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] rounded-xl p-2.5 pl-3">
                  <span className="text-xs text-emerald-400 font-mono font-bold">@</span>
                  <input
                    type="text"
                    value={orgDomain}
                    onChange={(e) => setOrgDomain(e.target.value)}
                    placeholder="mycompany.co.za"
                    className="bg-transparent text-xs text-white font-mono flex-1 focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8B949E] font-mono px-2 py-0.5 bg-[#0D1117] rounded">10 Seats</span>
                </div>
                <p className="text-[10px] text-[#8B949E]">
                  Up to 10 colleagues signing in with `@<span>{orgDomain || "mycompany.co.za"}</span>` will automatically share this Enterprise license.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black text-xs font-extrabold rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Verify Enterprise Code (Received via Email)</span>
                </button>
                <button
                  onClick={handleSimulateEFT}
                  className="w-full sm:w-auto px-4 py-3 bg-[#21262D] hover:bg-[#30363D] text-amber-400 text-xs font-bold rounded-xl transition cursor-pointer border border-amber-500/30 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Instant EFT</span>
                </button>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between">
            <span className="text-[11px] text-[#8B949E]">Need assistance? Contact Thami at +27 78 245 9205</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      <VerifyCodeModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerify={handleCodeVerified}
        defaultDomain={orgDomain}
      />
    </>
  );
}
