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
              className="px-4 py-2 rounded-xl border border-[#2A3442] hover:border-emerald-400 text-xs sm:text-sm font-bold transition-all"
            >
              Sign In
            </Link>
            <button
              onClick={handleLandingGoogleSignIn}
              disabled={isGoogleLoading}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold transition-all"
            >
              {isGoogleLoading ? "Connecting..." : "Get Started with Google"}
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold hover:bg-[#E7EAF0] transition-all"
              >
                {isGoogleLoading ? "Signing in..." : "Get Started with Google"}
              </button>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-[#2A3442] hover:border-emerald-400 font-bold transition-all"
              >
                Sign Up
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
                Click Get Started or Sign In to continue to the app at /app.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
