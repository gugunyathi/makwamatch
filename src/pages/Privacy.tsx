import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <Lock className="w-5 h-5" />
          <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
        </div>
        <p className="text-xs text-[#8B949E]">Effective date: 9 July 2026 · Last updated: 9 July 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#8B949E]">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. Introduction</h3>
            <p>
              Makwa Capital Partners ("Makwa Match", "we", "us", "our") is committed to protecting your personal
              information. This Privacy Policy explains how we collect, use, store, and share data when you use
              the Makwa Match platform ("Platform"). It applies to all users regardless of access role — guest,
              Startup, Investor, or Makwa VC.
            </p>
            <p>
              We comply with the Protection of Personal Information Act 4 of 2013 (POPIA), the General Data
              Protection Regulation (GDPR) where applicable, and other relevant data protection frameworks
              across the African continent.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">2. Information We Collect</h3>
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Registration data:</strong> Name, email address, phone number,
                company affiliation, and selected platform role.
              </li>
              <li>
                <strong className="text-white">Profile data:</strong> Startup pitch information, funding stage,
                deal terms, traction metrics, team biographies, and dataroom documents uploaded by founders.
              </li>
              <li>
                <strong className="text-white">Investor preference data:</strong> Sector focus, investment
                stages, ticket size range, and match preferences.
              </li>
              <li>
                <strong className="text-white">Usage data:</strong> Swipe history, bookmarked startups, liked
                startups, session activity, and AI analysis requests.
              </li>
              <li>
                <strong className="text-white">Communication data:</strong> Encrypted direct messages exchanged
                between platform users.
              </li>
              <li>
                <strong className="text-white">Technical data:</strong> IP address, browser type, device
                identifiers, and access timestamps, collected automatically when you use the Platform.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">3. How We Use Your Information</h3>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage your account and authenticate you securely.</li>
              <li>Match investors with relevant startups based on mandate and profile data.</li>
              <li>Generate AI-assisted deal-flow analysis, pitch improvements, and compatibility scores.</li>
              <li>Facilitate encrypted direct messaging between founders and investors.</li>
              <li>Personalise your discovery feed and improve platform recommendations.</li>
              <li>Maintain platform security, detect fraud, and prevent abuse.</li>
              <li>Comply with legal obligations including POPIA and GDPR.</li>
              <li>Send transactional notifications about your account or matched connections.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">4. Legal Basis for Processing</h3>
            <p>We process your personal information on the following legal bases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Contract performance:</strong> To provide the services you requested when creating an account.</li>
              <li><strong className="text-white">Legitimate interests:</strong> To improve the Platform, prevent fraud, and personalise your experience.</li>
              <li><strong className="text-white">Consent:</strong> Where you have explicitly agreed, such as for marketing communications or push notifications.</li>
              <li><strong className="text-white">Legal obligation:</strong> To comply with applicable laws and regulatory requirements.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">5. Data Sharing</h3>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Other platform users:</strong> Authenticated investors can view
                full founder profiles and contact details. Unauthenticated guests see only anonymised previews.
              </li>
              <li>
                <strong className="text-white">Service providers:</strong> MongoDB Atlas (database), Google
                Cloud (AI inference via Gemini API and Google Identity Services for sign-in), and Vercel (hosting). All
                providers are bound by data processing agreements.
              </li>
              <li>
                <strong className="text-white">Regulatory authorities:</strong> Where required by law, court
                order, or regulatory request.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">6. Data Retention</h3>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide
              services. Startup profiles and investor records are retained for a minimum of 5 years to support
              investment recordkeeping obligations. You may request deletion of your account and associated data
              at any time (see Section 8).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">7. Security</h3>
            <p>
              We implement industry-standard security measures to protect your data, including HMAC-signed
              session tokens, scrypt password hashing, TLS encryption in transit, and role-based access control
              on all API endpoints. Direct messages are encrypted on the client before transmission. No security
              system is perfect; you are responsible for keeping your account credentials secure.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">8. Your Rights</h3>
            <p>Under POPIA and GDPR (where applicable) you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal information we hold about you.</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-white">Deletion:</strong> Request erasure of your personal information ("right to be forgotten").</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests.</li>
              <li><strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong className="text-white">Withdrawal of consent:</strong> Withdraw consent at any time without affecting prior processing.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@makwamatch.co.za" className="text-emerald-400 hover:underline">
                privacy@makwamatch.co.za
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">9. Cookies and Local Storage</h3>
            <p>
              The Platform uses browser local storage (not cookies) to persist session tokens, user preferences,
              and offline cache data on your device. No third-party advertising trackers are used. You may clear
              local storage at any time through your browser settings, which will sign you out of the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">10. International Transfers</h3>
            <p>
              Your data may be processed in the United States (Vercel, Google Cloud, MongoDB Atlas) and other
              jurisdictions outside South Africa. We ensure that such transfers are governed by adequate data
              protection safeguards, including standard contractual clauses where required.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">11. Children's Privacy</h3>
            <p>
              The Platform is not directed at children under 18 years of age. We do not knowingly collect
              personal information from minors. If you believe a minor has registered on the Platform, please
              contact us immediately and we will delete the account.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">12. Changes to this Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an
              updated effective date. Continued use of the Platform after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">13. Contact & Information Officer</h3>
            <p>
              For privacy enquiries or to lodge a complaint, contact our Information Officer at{" "}
              <a href="mailto:privacy@makwamatch.co.za" className="text-emerald-400 hover:underline">
                privacy@makwamatch.co.za
              </a>
              . You may also lodge a complaint with the Information Regulator (South Africa) at{" "}
              <a
                href="https://www.justice.gov.za/inforeg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                www.justice.gov.za/inforeg
              </a>
              .
            </p>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-[#30363D] pt-6 text-xs text-[#8B949E]">
          <Link to="/" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Makwa Match
          </Link>
          <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            ← Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
