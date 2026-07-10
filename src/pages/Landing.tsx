import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithGoogle } from "../lib/googleAuth";

export default function Landing() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLandingGoogleSignIn = async () => {
    if (isGoogleLoading) {
      return;
    }

    setIsGoogleLoading(true);
    try {
      await signInWithGoogle({ role: "investor", company: "Makwa Capital" });
      navigate("/app");
    } catch (error) {
      console.error("Landing Google sign-in failed", error);
      alert("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-screen bg-[#0A0C10] text-[#E0E0E0] overflow-x-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(251,191,36,0.14),transparent_44%)]" />

        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black font-black grid place-items-center">M</div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">Makwa Match</p>
              <p className="text-[11px] text-[#8B949E]">Founder and investor matching platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold border border-emerald-400 shadow-sm transition-all"
            >
              Guest Mode Access (No Sign In)
            </Link>
            <button
              onClick={handleLandingGoogleSignIn}
              disabled={isGoogleLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F7FB] text-[#1F1F1F] text-xs sm:text-sm font-semibold border border-[#D0D5DD] shadow-sm transition-all disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
            </button>
          </div>
        </header>

        <main className="grid lg:grid-cols-2 gap-8 items-start">
          <section className="space-y-5">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
              Venture Discovery for Africa
            </p>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white">
              Discover high-potential startups and match with the right investors.
            </h1>
            <p className="text-sm sm:text-base text-[#A4ACB8] max-w-xl leading-relaxed">
              Makwa Match helps founders showcase their companies and helps investors review, swipe, shortlist, and connect with ventures that match their mandate. The platform includes startup discovery, secure messaging, data-room previews, and AI-assisted deal flow insights.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#2A3442] bg-[#0F141B] p-4">
                <p className="text-xl font-black text-emerald-300">70+</p>
                <p className="text-xs text-[#8B949E]">Vetted startup applications</p>
              </div>
              <div className="rounded-2xl border border-[#2A3442] bg-[#0F141B] p-4">
                <p className="text-xl font-black text-blue-300">AI</p>
                <p className="text-xs text-[#8B949E]">Insight summaries and scoring</p>
              </div>
              <div className="rounded-2xl border border-[#2A3442] bg-[#0F141B] p-4">
                <p className="text-xl font-black text-amber-300">3 Tiers</p>
                <p className="text-xs text-[#8B949E]">Guest, Signed-in, Enterprise access</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleLandingGoogleSignIn}
                disabled={isGoogleLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#1F1F1F] font-semibold hover:bg-[#F5F7FB] border border-[#D0D5DD] shadow-sm transition-all disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
              </button>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold border border-emerald-400 shadow-sm transition-all"
              >
                Guest Mode Access (No Sign In)
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-[#2A3442] bg-[#0D1117]/90 p-6 sm:p-7 shadow-2xl">
            <h2 className="text-lg sm:text-xl font-extrabold text-white mb-4">How the app works</h2>
            <ol className="space-y-3 text-sm text-[#B8C0CC] list-decimal pl-5">
              <li>Open the app and sign in with Google, email, or mobile.</li>
              <li>Access the swipe deck to review startups quickly.</li>
              <li>Open profiles, compare traction, and save top matches.</li>
              <li>Message founders and continue due diligence in-app.</li>
            </ol>
            <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
              <p className="text-xs text-emerald-200 leading-relaxed">
                Click Guest Mode Access (No Sign In) or Sign in with Google to continue to the app at /app.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
