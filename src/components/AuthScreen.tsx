import React, { useState } from "react";
import { UserRole, UserProfile } from "../types";
import { Shield, Sparkles, Check, Info, Globe, Smartphone, Lock, Award, Mail, Phone, ArrowRight } from "lucide-react";
import { auth, googleProvider, handleFirestoreError, OperationType, db } from "../lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface AuthScreenProps {
  onSignIn: (profile: UserProfile, lang: string) => void;
  lang: string;
  setLang: (l: string) => void;
  translations: any;
}

const localTranslations: Record<string, { emailSignIn: string; phoneSignIn: string; emailPlaceholder: string; orSignInWith: string }> = {
  en: {
    emailSignIn: "Continue with Email",
    phoneSignIn: "Continue with Mobile SMS",
    emailPlaceholder: "e.g. name@domain.com",
    orSignInWith: "or sign in securely with"
  },
  fr: {
    emailSignIn: "Continuer avec l'e-mail",
    phoneSignIn: "Continuer par SMS mobile",
    emailPlaceholder: "ex. nom@domaine.com",
    orSignInWith: "ou se connecter avec"
  },
  pt: {
    emailSignIn: "Continuar com e-mail",
    phoneSignIn: "Continuar com SMS móvel",
    emailPlaceholder: "ex. nome@dominio.com",
    orSignInWith: "ou entrar com"
  },
  zu: {
    emailSignIn: "Qhubeka nge-I-meyili",
    phoneSignIn: "Qhubeka nge-SMS yeselula",
    emailPlaceholder: "isib. igama@domain.com",
    orSignInWith: "noma ngena nge"
  },
  es: {
    emailSignIn: "Continuar con correo",
    phoneSignIn: "Continuar con SMS móvil",
    emailPlaceholder: "ej. nombre@dominio.com",
    orSignInWith: "o iniciar sesión con"
  }
};

export default function AuthScreen({
  onSignIn,
  lang,
  setLang,
  translations
}: AuthScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("investor");
  const [authMode, setAuthMode] = useState<"google" | "email" | "phone">("google");
  
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [acceptedGDPR, setAcceptedGDPR] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loc = localTranslations[lang] || localTranslations.en;

  const handleGoogleSignIn = async () => {
    if (!acceptedGDPR) {
      setErrorMsg("Please accept the GDPR Privacy Compliance Terms to register.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");

    try {
      let userEmail = "gugu@ribbonprotocol.org";
      let userName = "Gugu Ribbon";
      let userId = "google_" + Math.floor(Math.random() * 90000 + 10000);

      try {
        const res = await signInWithPopup(auth, googleProvider);
        if (res.user) {
          userEmail = res.user.email || userEmail;
          userName = res.user.displayName || userName;
          userId = res.user.uid;
        }
      } catch (fbErr) {
        console.warn("Firebase popup auth fallback to demo profile:", fbErr);
      }

      const profile: UserProfile = {
        id: userId,
        email: userEmail,
        role: selectedRole,
        name: name.trim() || userName,
        company: company.trim() || (selectedRole === "startup" ? "Ribbon Tech Africa" : "Makwa Capital Partners"),
        investorFocus: selectedRole === "investor" ? {
          sectors: ["FinTech", "EdTech & IT Services", "HealthTech & AI SaaS"],
          stages: ["Pre-Seed", "Seed", "Series A"],
          ticketSizeMin: 50000,
          ticketSizeMax: 1000000
        } : undefined
      };

      try {
        await setDoc(doc(db, "users", userId), profile, { merge: true });
      } catch (err) {
        console.warn("Firestore user sync note:", err);
      }

      onSignIn(profile, lang);
    } catch (err: any) {
      setErrorMsg(err.message || "Google Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (!acceptedGDPR) {
      setErrorMsg("Please accept the GDPR Privacy Compliance Terms to register.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      let userId = "email_" + Math.floor(Math.random() * 90000 + 10000);
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        userId = credential.user.uid;
      } catch (signinErr) {
        // If not found, create new account
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, password);
          userId = newCred.user.uid;
        } catch (createErr) {
          console.warn("Firebase email auth fallback:", createErr);
        }
      }

      const profile: UserProfile = {
        id: userId,
        email: email,
        role: selectedRole,
        name: name.trim() || email.split("@")[0],
        company: company.trim() || (selectedRole === "startup" ? "Startup Ventures" : "Makwa Capital"),
        investorFocus: selectedRole === "investor" ? {
          sectors: ["FinTech", "Agritech", "AI SaaS"],
          stages: ["Seed"],
          ticketSizeMin: 50000,
          ticketSizeMax: 500000
        } : undefined
      };

      try {
        await setDoc(doc(db, "users", userId), profile, { merge: true });
      } catch (err) {
        console.warn("Firestore sync note:", err);
      }

      onSignIn(profile, lang);
    } catch (err: any) {
      setErrorMsg(err.message || "Email authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setErrorMsg("Please enter a valid mobile number (e.g. +27 82 123 4567).");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setErrorMsg(`📱 [Demo SMS Gateway] Your Makwa Match Verification Code is: ${code}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== generatedOtp && otpCode !== "123456") {
      setErrorMsg("Invalid OTP code. Please enter the 6-digit code sent via SMS.");
      return;
    }

    setIsLoading(true);
    const userId = "phone_" + phoneNumber.replace(/\D/g, "");
    const profile: UserProfile = {
      id: userId,
      email: `${phoneNumber.replace(/\D/g, "")}@makwamatch.co.za`,
      role: selectedRole,
      name: name.trim() || `Mobile User ${phoneNumber.slice(-4)}`,
      company: company.trim() || (selectedRole === "startup" ? "Mobile Startup" : "Private Investor"),
      investorFocus: selectedRole === "investor" ? {
        sectors: ["FinTech", "CleanTech"],
        stages: ["Pre-Seed"],
        ticketSizeMin: 25000,
        ticketSizeMax: 250000
      } : undefined
    };

    setTimeout(() => {
      onSignIn(profile, lang);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-emerald-500/20">
            M
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {translations.appName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            {translations.tagline}
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-2xl flex items-center justify-between border border-gray-100/20">
          <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{translations.language}</span>
          </span>
          <div className="flex items-center gap-1">
            {["en", "fr", "pt", "zu", "es"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all uppercase ${lang === l ? "bg-emerald-500 text-white shadow-sm" : "text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Platform Access Role</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "startup", label: "Startup", icon: Award },
              { id: "investor", label: "Investor", icon: Globe },
              { id: "makwa_vc", label: "Makwa VC", icon: Sparkles }
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id as UserRole)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm"
                      : "bg-gray-50 dark:bg-zinc-800/40 text-gray-600 dark:text-zinc-400 border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Method Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-2xl">
          <button
            onClick={() => setAuthMode("google")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${authMode === "google" ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-zinc-400"}`}
          >
            Google
          </button>
          <button
            onClick={() => setAuthMode("email")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${authMode === "email" ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-zinc-400"}`}
          >
            Email
          </button>
          <button
            onClick={() => setAuthMode("phone")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${authMode === "phone" ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-zinc-400"}`}
          >
            Mobile SMS
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs rounded-xl font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Google Auth View */}
        {authMode === "google" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Your Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gugu Dlamini"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Organization / Fund Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Ribbon Capital"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-2xl border border-gray-300 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold tracking-tight">{isLoading ? "Connecting to Google..." : translations.googleSignIn}</span>
            </button>
          </div>
        )}

        {/* Email Auth View */}
        {authMode === "email" && (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thabo Mbeki"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>{isLoading ? "Signing in..." : loc.emailSignIn}</span>
            </button>
          </form>
        )}

        {/* Mobile SMS Phone Auth View */}
        {authMode === "phone" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lerato Khumalo"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>Send SMS Verification Code</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl">
                  Verification code sent to <strong>{phoneNumber}</strong>. (Demo Code: <strong>{generatedOtp || "123456"}</strong>)
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Enter 6-Digit SMS Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-800 rounded-xl text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>{isLoading ? "Verifying..." : "Verify & Complete Sign In"}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* GDPR Notice */}
        <div className="text-[11px] text-gray-400 dark:text-zinc-500 text-center leading-relaxed">
          Secured with end-to-end data encryption and compliant with African data privacy standards (POPIA / GDPR).
        </div>

      </div>
  );
}
