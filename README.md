# Makwa VC Venture Deck & Startup Matchmaking Platform 🇿🇦

**Makwa Match** is an elite, fully functional, AI-powered Venture Capital & Startup Matchmaking platform designed specifically for the South African and pan-African tech ecosystem. It connects high-growth African startups with top-tier local and international investors using intelligent swipe-to-match algorithms, secure virtual data rooms, team directories, AI deal-flow scoring, and end-to-end encrypted direct messaging.

---

## 🚀 Key Features & Enterprise Modules

1. **Interactive Deal Discovery Deck**:
   - **Tinder-Style Swipe Mechanics**: Smooth spring physics animations for swiping left (pass) or right (match/connect).
   - **Full Touch & Keyboard Support**: Full touch screen swipe gestures, on-screen action buttons, and keyboard arrow navigation (`←` Left to pass, `→` Right to match).
   - **5-Second Undo Timer**: Accidentally swiped? Instantly undo your last swipe within 5 seconds.
   - **Detailed Founder & Team Directory**: Explore verified founder bios, professional backgrounds, education credentials, and direct LinkedIn/email links for every startup team member.

2. **Multi-Provider Authentication**:
   - **Google Sign-In**: Secure OAuth sign-in via Google Identity Services with Mongo-backed sessions.
   - **Email & Password**: Traditional account creation and authentication.
   - **Mobile SMS OTP**: Phone number authentication with 6-digit SMS verification code support.

3. **Cloud Backend & Real-Time Database**:
   - **MongoDB Atlas Integration**: Cloud persistence for startups, user profiles, bookmarks, direct messages, sessions, and auth history.
   - **Offline-First Resilience**: Automatic fallback to local storage when network conditions fluctuate.

4. **Gemini AI Intelligence Engine**:
   - **Automated Deal-Flow Scoring**: Generates VC investment readiness scores, risk analyses, and growth recommendations using `@google/genai`.
   - **Investor Compatibility Matching**: Analyzes portfolio thesis match against startup traction and sector focus.
   - **AI Pitch & Card Builder**: Helps founders transform raw notes into structured investor-ready profiles.

5. **Secure Virtual Data Room**:
   - Document repository for pitch decks, financial models, cap tables, and compliance checklists.

6. **Multilingual Localization**:
   - Seamless switching between English, French, Portuguese, Zulu, and Spanish.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons, Motion (Framer Motion) animations.
- **Backend**: Node.js, Express.js server with RESTful API endpoints and Gemini AI SDK (`@google/genai`).
- **Database & Auth**: MongoDB Atlas, custom Express session auth, Google Identity Services.
- **Build System**: Vite, Esbuild, TypeScript.

---

## 📦 Getting Started & Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Quick Start

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

## 📄 License & Community

Built for the African tech and venture capital community. Powered by Makwa VC.

