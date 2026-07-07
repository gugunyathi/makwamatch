# Makwa Match South Africa 🇿🇦

**Makwa Match** is an elite, fully functional, AI-powered Venture Capital & Startup Matchmaking platform designed specifically for the South African and African tech ecosystem. It connects high-growth African startups with top-tier local and international investors using intelligent swipe-to-match algorithms, secure virtual data rooms, AI deal-flow scoring, and end-to-end encrypted direct messaging.

---

## 🚀 Key Features & Enterprise Modules

1. **Multi-Provider Authentication**:
   - **Google Sign-In**: Secure OAuth sign-in via Firebase Auth.
   - **Email & Password**: Traditional account creation and authentication.
   - **Mobile SMS OTP**: Phone number authentication with 6-digit SMS verification code support.

2. **Cloud Backend & Database**:
   - **Firebase Firestore Integration**: Real-time cloud synchronization for startups, user profiles, bookmarks, and direct messages (connected to project `ai-studio-67eddd9f-e3a0-4cc8-af18-c83c90830349`).
   - **Offline-First Resilience**: Automatic fallback to local storage when network conditions fluctuate.

3. **Gemini AI Intelligence Engine**:
   - **Automated Deal-Flow Scoring**: Generates VC investment readiness scores, risk analyses, and growth recommendations using `gemini-2.5-flash`.
   - **Investor Compatibility Matching**: Analyzes portfolio thesis match against startup traction and sector focus.
   - **AI Pitch & Card Builder**: Helps founders transform raw notes into structured investor-ready profiles.

4. **Interactive Discovery Deck**:
   - Swipe-to-match interface for exploring early-stage and growth-stage South African startups across Fintech, AgriTech, CleanTech, HealthTech, AI, and SaaS.
   - Deep-linking support to share specific startup deal cards directly with co-investors.

5. **Secure Virtual Data Room**:
   - Document repository for pitch decks, financial models, cap tables, and compliance checklists.

6. **Multilingual Localization**:
   - Seamless switching between English, French, Portuguese, Zulu, and Spanish.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons, Motion Animations.
- **Backend**: Node.js, Express.js server with RESTful API endpoints and Gemini AI SDK (`@google/genai`).
- **Database & Auth**: Firebase Firestore & Firebase Auth (`firebase`).
- **Build System**: Vite, Esbuild, TypeScript.

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

This project is built for the African tech and venture capital community.
