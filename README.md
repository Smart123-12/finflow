# 💎 FinFlow — Premium Personal Finance Tracker & AI Advisor

FinFlow is a premium, personal cash-flow analyzer and savings coaching web application designed with modern SaaS fintech aesthetics (glassmorphism, vibrant palettes, dark/light modes, micro-animations).

## 🚀 Key Features

1. **Fintech Dashboard Layout**: Tracks Total Balance, Monthly Inflows (Income), Outflows (Expenses), and Savings Rate indices.
2. **Interactive Recharts Systems**: Fully custom vector Area charts for savings growth, donut charts for expense distribution, and Double Bar charts for cash flow cycle evaluations.
3. **Budget Goal Planners**: Color-shifting limit meters (Green $\rightarrow$ Amber $\rightarrow$ Red) with automated warning alerts and breach indicators.
4. **CSV & PDF Statements**: Instant CSV file compilers and highly styled browser print-styles to compile high-quality cash-flow PDF statements.
5. **Session Identity Handshake**: salt-hashed database passwords with JSON Web Tokens (JWT) protecting core queries.
6. **Resilient Offline Fallback**: Features an automated **JSON file-based Mock Database fallback**. Boot the application instantly without running a local MongoDB database!
7. **Expert AI Personal Wealth Coach**: Local rule-based advisory diagnostics combined with **live Google Gemini API Model integration** if configured.
8. **One-Click Cash-Flow Seeder**: Instantly seeds sample transactions and budgets on the profile screen to instantly preview interactive charts and AI coaching!

---

## 🛠️ System Requirements & Architecture

- **Frontend Environment**: Vite + React 18 + Tailwind CSS + React Router + Axios + Recharts
- **Backend API Server**: Node.js + Express + Mongoose + BCrypt + JSONWebToken
- **Database Engine**: MongoDB (with automated resilient file-based storage fallback)
- **AI Core**: Heuristics Rule Engine + optional Google Gemini 1.5 Flash API Integration

---

## 💻 Launch Instructions

Follow these step-by-step instructions to run the application on your system:

### 1. Configure the Backend Environment
1. Open a terminal panel and change directory into `/backend`.
2. Install standard node modules:
   ```bash
   npm install
   ```
3. Initialize the development variables:
   - File `backend/.env` is already configured for you with a local database string and a placeholder for optional Gemini keys:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/finance_tracker
     JWT_SECRET=supersecretjwtkeyforfinflow
     GEMINI_API_KEY=your_google_gemini_api_key_here
     ```
4. Start the backend API:
   ```bash
   npm run start
   ```
   *Note: If local MongoDB is not running, the console will print a `Resilient Mock Database activated` status message, and the app will store files in `backend/src/services/temp_db.json`!*

### 2. Configure the Frontend Dev Server
1. Open a separate terminal panel and change directory into `/frontend`.
2. Install react assets:
   ```bash
   npm install
   ```
3. Start the Vite hot reloading dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to: **[http://localhost:5173](http://localhost:5173)**!

---

## 💡 Quick Demo Path

1. **Sign Up**: Register a new credentials passcode on the register screen.
2. **Go to Profile**: Navigate to the "My Profile" tab in the left-hand sidebar.
3. **Trigger Seeder**: Click **"Seed Sample Cash Flow"**. This will instantly populate 8 cash-flow transactions and 3 category budgets.
4. **Review Dashboard**: Navigate back to "Dashboard" to witness:
   - Calculated Net Balance ($3,670), Revenue ($4,950), Outgoings ($1,280), and Savings Rate (74.1%).
   - Glowing interactive savings area charts, expense cells, and double bar comparisons.
   - Comprehensive budget indicators displaying progress limits.
   - Elegant **AI Wealth diagnostics** outlining category advice and checkboxes!
5. **Adjust Limits & CRUD**: Set new budgets on the Planner page, add a transaction to trigger budget overrun toasts, filter ledger history, or export CSV statements.
