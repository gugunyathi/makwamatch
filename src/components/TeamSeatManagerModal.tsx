import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Mail, CheckCircle, Shield, X, Key, AlertCircle } from "lucide-react";

interface TeamSeatManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterpriseDomain: string;
  ownerEmail: string;
  addNotification: (msg: string) => void;
}

interface TeamMember {
  email: string;
  addedAt: string;
  verified: boolean;
  token?: string;
}

export default function TeamSeatManagerModal({
  isOpen,
  onClose,
  enterpriseDomain,
  ownerEmail,
  addNotification
}: TeamSeatManagerModalProps) {
  const storageKey = `makwa_enterprise_team_seats_${enterpriseDomain || "default"}`;
  
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [newEmail, setNewEmail] = useState("");
  const [verifyingMember, setVerifyingMember] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(members));
    } catch (e) {
      // ignore
    }
  }, [members, storageKey]);

  if (!isOpen) return null;

  const totalAllowedSeats = 10;
  const currentSeatCount = members.length + 1; // +1 for owner

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrim = newEmail.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const domainPart = emailTrim.split("@")[1];
    if (enterpriseDomain && domainPart !== enterpriseDomain.toLowerCase()) {
      setError(`Email must belong to your organization domain (@${enterpriseDomain}).`);
      return;
    }

    if (emailTrim === ownerEmail.toLowerCase()) {
      setError("You are the license owner.");
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === emailTrim)) {
      setError("This email is already added to your team seats.");
      return;
    }

    if (currentSeatCount >= totalAllowedSeats) {
      setError("Maximum limit of 10 team seats reached for this Enterprise license.");
      return;
    }

    // Generate unique verification token
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    const newMember: TeamMember = {
      email: emailTrim,
      addedAt: new Date().toLocaleDateString(),
      verified: false,
      token
    };

    setMembers([...members, newMember]);
    setNewEmail("");
    addNotification(`Verification token sent to ${emailTrim} (Simulated Token: ${token})`);
    setVerifyingMember(emailTrim);
  };

  const handleVerifyToken = (email: string) => {
    const member = members.find((m) => m.email === email);
    if (!member) return;

    if (inputToken.trim() === member.token) {
      setMembers(members.map((m) => (m.email === email ? { ...m, verified: true } : m)));
      setVerifyingMember(null);
      setInputToken("");
      addNotification(`🎉 Team member ${email} successfully verified and granted Enterprise seat!`);
    } else {
      setError("Invalid verification token. Please check the simulated token.");
    }
  };

  const handleRemove = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
    addNotification(`Removed ${email} from Enterprise team seats.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise Team Seat Manager</h3>
              <p className="text-[11px] text-[#8B949E]">Manage your organization's 10 seats (@{enterpriseDomain})</p>
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Capacity Banner */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8B949E] font-bold uppercase tracking-wider block">License Allocation</span>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span>{currentSeatCount} / {totalAllowedSeats} Seats Used</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {totalAllowedSeats - currentSeatCount} Available
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">
              {Math.round((currentSeatCount / totalAllowedSeats) * 100)}%
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Member Form */}
          <form onSubmit={handleInvite} className="space-y-3 bg-[#0D1117] border border-[#30363D] rounded-xl p-4">
            <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Invite Team Member (@{enterpriseDomain})
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setError(null); }}
                placeholder={`colleague@${enterpriseDomain}`}
                className="bg-[#161B22] border border-[#30363D] rounded-xl px-3 py-2 text-xs text-white font-mono flex-1 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={currentSeatCount >= totalAllowedSeats}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black text-xs font-extrabold rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>Add Member</span>
              </button>
            </div>
            <p className="text-[10px] text-[#8B949E]">
              New members will receive a verification token to claim their secure Enterprise seat.
            </p>
          </form>

          {/* Seats List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Team Seats ({currentSeatCount}/10)</h4>
            
            <div className="space-y-2">
              {/* Owner Item */}
              <div className="bg-[#0D1117] border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    👑
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{ownerEmail} (You)</span>
                    <span className="text-[10px] text-emerald-400">Enterprise License Owner / Admin</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                  Verified Owner
                </span>
              </div>

              {/* Members */}
              {members.map((member) => (
                <div key={member.email} className="bg-[#0D1117] border border-[#30363D] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#21262D] text-[#8B949E] flex items-center justify-center font-bold text-xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{member.email}</span>
                        <span className="text-[10px] text-[#8B949E]">Added on {member.addedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.verified ? (
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified Seat
                        </span>
                      ) : (
                        <button
                          onClick={() => setVerifyingMember(verifyingMember === member.email ? null : member.email)}
                          className="text-[10px] font-mono bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition cursor-pointer"
                        >
                          {member.token ? `Simulated Token: ${member.token}` : "Verify Token"}
                        </button>
                      )}

                      <button
                        onClick={() => handleRemove(member.email)}
                        className="p-1.5 text-[#8B949E] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        title="Remove Seat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Token Verification Box if expanding */}
                  {verifyingMember === member.email && !member.verified && (
                    <div className="bg-[#161B22] border border-amber-500/30 rounded-lg p-3 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" /> Email Verification Token
                        </span>
                        <span className="text-[10px] text-[#8B949E] font-mono">Demo Token: {member.token}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputToken}
                          onChange={(e) => setInputToken(e.target.value)}
                          placeholder="Enter 6-digit token"
                          className="bg-[#0D1117] border border-[#30363D] rounded-lg px-2.5 py-1 text-xs text-white font-mono flex-1 focus:outline-none"
                        />
                        <button
                          onClick={() => handleVerifyToken(member.email)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Verify & Claim
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-6 text-xs text-[#8B949E] border border-dashed border-[#30363D] rounded-xl">
                  No additional team members added yet. You have {totalAllowedSeats - 1} available seats.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between">
          <span className="text-[11px] text-[#8B949E]">All 10 seats share the ZAR 50,000 Annual Enterprise License.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
