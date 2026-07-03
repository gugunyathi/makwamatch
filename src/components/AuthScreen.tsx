import React, { useState } from "react";
import { UserRole, UserProfile } from "../types";
import { Shield, Sparkles, Check, Info, Globe, Smartphone, Lock, Award } from "lucide-react";

interface AuthScreenProps {
  onSignIn: (profile: UserProfile, lang: string) => void;
  lang: string;
  setLang: (l: string) => void;
  translations: any;
}

const localTranslations: Record<string, { emailSignIn: string; emailPlaceholder: string; orSignInWithEmail: string }> = {
  en: {
    emailSignIn: "Continue with Email",
    emailPlaceholder: "e.g. name@domain.com",
    orSignInWithEmail: "or sign in with email"
  },
  fr: {
    emailSignIn: "Continuer avec l'e-mail",
    emailPlaceholder: "ex. nom@domaine.com",
    orSignInWithEmail: "ou connectez-vous avec l'e-mail"
  },
  pt: {
    emailSignIn: "Continuar com e-mail",
    emailPlaceholder: "ex. nome@dominio.com",
    orSignInWithEmail: "ou entrar com e-mail"
  },
  zu: {
    emailSignIn: "Qhubeka nge-I-meyili",
    emailPlaceholder: "isib. igama@domain.com",
    orSignInWithEmail: "noma ngemeyili"
  },
  es: {
    emailSignIn: "Continuar con correo",
    emailPlaceholder: "ej. nombre@dominio.com",
    orSignInWithEmail: "o iniciar sesión con correo"
  }
};

export default function AuthScreen({
  onSignIn,
  lang,
  setLang,
  translations
}: AuthScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("investor");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedGDPR, setAcceptedGDPR] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInWithEmail, setIsSigningInWithEmail] = useState(false);

  const loc = localTranslations[lang] || localTranslations.en;

  const handleGoogleSignIn = () => {
    if (!acceptedGDPR) {
      alert("Please accept the GDPR & CCPA Privacy Compliance Terms to register.");
      return;
    }

    setIsSigningIn(true);
    setTimeout(() => {
      const finalName = name.trim() || "Gugu Ribbon";
      const finalEmail = email.trim() || "gugu@ribbonprotocol.org";
      const mockProfile: UserProfile = {
        id: String(Math.floor(Math.random() * 9000) + 1000),
        email: finalEmail,
        role: selectedRole,
        name: finalName,
        company: company.trim() || (selectedRole === "startup" ? "Ribbon Tech" : "Makwa Capital"),
        investorFocus: selectedRole === "investor" ? {
          sectors: ["FinTech", "EdTech & IT Services", "HealthTech & AI SaaS"],
          stages: ["Pre-Seed", "Seed"],
          ticketSizeMin: 50000,
          ticketSizeMax: 1000000
        } : undefined
      };
      onSignIn(mockProfile, lang);
      setIsSigningIn(false);
    }, 1200);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide your name to register.");
      return;
    }
    if (!email.trim()) {
      alert("Please provide your email address to register.");
      return;
    }
    if (!acceptedGDPR) {
      alert("Please accept the GDPR & CCPA Privacy Compliance Terms to register.");
      return;
    }

    setIsSigningInWithEmail(true);
    setTimeout(() => {
      const mockProfile: UserProfile = {
        id: String(Math.floor(Math.random() * 9000) + 1000),
        email: email.trim(),
        role: selectedRole,
        name: name.trim(),
        company: company.trim() || (selectedRole === "startup" ? "My Startup" : "Makwa Capital"),
        investorFocus: selectedRole === "investor" ? {
          sectors: ["FinTech", "EdTech & IT Services", "HealthTech & AI SaaS"],
          stages: ["Pre-Seed", "Seed"],
          ticketSizeMin: 50000,
          ticketSizeMax: 1000000
        } : undefined
      };
      onSignIn(mockProfile, lang);
      setIsSigningInWithEmail(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            M
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {translations.appName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            {translations.tagline}
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-gray-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl flex items-center justify-between border border-gray-100/30">
          <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{translations.language}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${lang === "en" ? "bg-emerald-500 text-white" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("fr")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${lang === "fr" ? "bg-emerald-500 text-white" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
            >
              FR
            </button>
            <button
              onClick={() => setLang("pt")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${lang === "pt" ? "bg-emerald-500 text-white" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
            >
              PT
            </button>
            <button
              onClick={() => setLang("zu")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${lang === "zu" ? "bg-emerald-500 text-white" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
            >
              ZU
            </button>
            <button
              onClick={() => setLang("es")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${lang === "es" ? "bg-emerald-500 text-white" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Choose User Role</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedRole("startup")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                selectedRole === "startup"
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50"
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Startup</span>
            </button>

            <button
              onClick={() => setSelectedRole("investor")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                selectedRole === "investor"
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50"
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>Investor</span>
            </button>

            <button
              onClick={() => setSelectedRole("makwa_vc")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                selectedRole === "makwa_vc"
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Makwa VC</span>
            </button>
          </div>
        </div>

        {/* GDPR Acceptance checkbox */}
        <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-zinc-800/30 p-3 rounded-2xl border border-gray-100/20">
          <input
            type="checkbox"
            id="gdpr"
            checked={acceptedGDPR}
            onChange={(e) => setAcceptedGDPR(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-500 border-gray-300 focus:ring-emerald-500 shrink-0 mt-0.5 cursor-pointer"
          />
          <label htmlFor="gdpr" className="text-[11px] text-gray-500 dark:text-zinc-400 leading-normal select-none cursor-pointer">
            <strong>GDPR & CCPA Compliant:</strong> I consent to the collection, end-to-end encryption of sensitive pitch deck files, and real-time on-chain matching logs.
          </label>
        </div>

        {/* Google sign in button (Google official design style) */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn || isSigningInWithEmail}
          className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 font-medium font-sans rounded-xl border border-gray-300 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5"
        >
          {/* Official Google G Logo */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-semibold tracking-tight">{isSigningIn ? "Authorizing via Google..." : translations.googleSignIn}</span>
        </button>

        {/* Decorative Divider */}
        <div className="flex items-center my-1.5">
          <div className="flex-1 border-t border-gray-200 dark:border-zinc-800"></div>
          <span className="px-3 text-[11px] text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wider">{loc.orSignInWithEmail}</span>
          <div className="flex-1 border-t border-gray-200 dark:border-zinc-800"></div>
        </div>

        {/* Email Sign In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nobuhle Mazibuko"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Company / VC Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Nobztech"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loc.emailPlaceholder}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSigningIn || isSigningInWithEmail}
            className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-white" />
            <span>{isSigningInWithEmail ? "Signing in with Email..." : loc.emailSignIn}</span>
          </button>
        </form>

        {/* Offline notification badge */}
        <div className="text-center text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
          📡 Supports 100% offline-first operations. Syncs data once network resumes.
        </div>

      </div>
    </div>
  );
}

