import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            M
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Makwa Match</h1>
            <p className="text-xs text-emerald-400 font-semibold">Investor–Founder Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <Shield className="w-5 h-5" />
          <h2 className="text-xl font-bold text-white">Terms of Service</h2>
        </div>
        <p className="text-xs text-[#8B949E]">Effective date: 9 July 2026 · Last updated: 9 July 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#8B949E]">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the Makwa Match platform ("Platform"), you agree to be bound by these Terms of
              Service ("Terms") and all applicable laws and regulations. If you do not agree with any part of these
              Terms, you may not use the Platform. Makwa Match is operated by Makwa Capital Partners ("we", "us",
              "our").
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. Eligibility</h3>
            <p>
              You must be at least 18 years of age and have the legal capacity to enter into binding contracts to
              use the Platform. By using Makwa Match, you represent and warrant that you meet all eligibility
              requirements. Makwa Match reserves the right to verify your identity at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">3. Platform Purpose</h3>
            <p>
              Makwa Match is an investor–founder matchmaking platform designed to connect accredited investors with
              early-stage startups across Africa. The Platform provides deal-flow discovery, AI-assisted analysis,
              secure messaging, and virtual dataroom features. Makwa Match does not provide financial advice,
              broker-dealer services, or investment recommendations.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">4. User Roles and Access Tiers</h3>
            <p>
              The Platform operates three access roles: <strong className="text-white">Startup</strong>,{" "}
              <strong className="text-white">Investor</strong>, and{" "}
              <strong className="text-white">Makwa VC</strong>. Guest users (unauthenticated) may access a limited
              set of anonymised startup previews. Full founder profiles, contact details, and dataroom documents are
              accessible only to authenticated users. Enterprise licence holders unlock additional team seat
              management features.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">5. User Obligations</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide false, misleading, or inaccurate information when registering or submitting a startup profile.</li>
              <li>Use the Platform to conduct fraudulent fundraising, spam, or unsolicited commercial communications.</li>
              <li>Reverse-engineer, scrape, or otherwise extract data from the Platform without written consent.</li>
              <li>Circumvent authentication controls or attempt to access another user's account or data.</li>
              <li>Use the Platform for any purpose that violates applicable laws or regulations.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">6. Intellectual Property</h3>
            <p>
              All content, trademarks, logos, and software on the Platform are the exclusive property of Makwa
              Capital Partners or its licensors. You are granted a limited, non-exclusive, non-transferable licence
              to access and use the Platform for its intended purpose. You may not copy, modify, distribute, or
              create derivative works from any Platform content without prior written permission.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">7. AI-Generated Content</h3>
            <p>
              The Platform uses AI models (including Google Gemini) to generate deal-flow analysis, pitch
              refinements, and compatibility scores. Such outputs are provided for informational purposes only and
              do not constitute financial, legal, or investment advice. Makwa Match makes no warranties about the
              accuracy or completeness of AI-generated content.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">8. Disclaimer of Warranties</h3>
            <p>
              The Platform is provided on an "as is" and "as available" basis without warranties of any kind,
              express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free
              of viruses or other harmful components. Your use of the Platform is at your sole risk.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">9. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by applicable law, Makwa Capital Partners shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from your use of or
              inability to use the Platform, even if we have been advised of the possibility of such damages.
              Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the
              claim.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">10. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account and access to the Platform at any time,
              with or without cause, and with or without notice. Upon termination, all provisions of these Terms
              that by their nature should survive will continue to apply.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">11. Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of South
              Africa. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the
              courts of South Africa.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">12. Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with an
              updated effective date. Your continued use of the Platform after any changes constitutes acceptance
              of the new Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">13. Contact</h3>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@makwamatch.co.za" className="text-emerald-400 hover:underline">
                legal@makwamatch.co.za
              </a>{" "}
              or write to Makwa Capital Partners, Johannesburg, South Africa.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-[#30363D] pt-6 text-xs text-[#8B949E]">
          <Link to="/" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Makwa Match
          </Link>
          <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
