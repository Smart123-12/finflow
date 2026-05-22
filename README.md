# 💎 FinFlow — Serverless Premium Personal Finance Tracker

FinFlow is a premium personal finance tracking and AI wealth advisor web application designed with modern SaaS fintech aesthetics (glassmorphic modules, HSL deep violet gradients, custom animations, responsive grids).

This project is configured as a **Serverless, Self-Contained static web application**. It runs 100% in your browser using local persistence. You can deploy it instantly for free to **GitHub Pages** with absolutely zero backend hosting configuration required!

---

## 🚀 Key Features

1. **Fintech Dashboard Layout**: Real-time Balance tracking, Monthly Revenue, Monthly Outgoings, and calculated Savings rates.
2. **Beautiful Recharts Analytics**: Animated Area charts for savings progression, Donut cells for category allocations, and Double-Bar cash flow charts.
3. **Budget Goal Planners**: Color-shifting capacity indicators (Green $\rightarrow$ Amber $\rightarrow$ Red) and automated category limit alerts.
4. **Client-Side CSV Statements**: Instant ledger spreadsheet exporter compiling formatted CSV sheets directly in the browser.
5. **Print-Friendly PDF layouts**: Seamless browser printable formatting styled to download clean cash-flow audit statements.
6. **In-Browser Secure Storage**: Stores transaction ledgers, active budgets, and authorization credentials persistently in the browser's LocalStorage.
7. **AI Wealth Diagnostics**: Dynamic rule-based personal financial advisor compiling diagnostics and recommendations.
8. **One-Click Demo Seeder**: Button in the Profile settings that instantly seeds 8 transactions and 3 category budgets to immediately preview charts and insights.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 18
- **Bundler & Dev Server**: Vite
- **Styling Directives**: Tailwind CSS (custom extensions)
- **Navigation Routing**: React Router DOM v6
- **Vector Icons**: Lucide React
- **Graphs Library**: Recharts
- **Notification Engine**: React Hot Toast
- **Deployment Strategy**: GitHub Pages + automated GitHub Actions deploy workflow

---

## 💻 Local Launch Instructions

To launch and run the app locally on your machine:

1. Open your terminal in the project directory:
   ```bash
   npm install
   ```
2. Start the Vite local hot-reloading dev server:
   ```bash
   npm run dev
   ```
3. Open your browser to: **[http://localhost:5173](http://localhost:5173)**!

---

## 🚀 Pushing & Deploying to GitHub Pages

This project features an automated GitHub Actions script (`.github/workflows/deploy.yml`). Whenever you push code to GitHub, your project will compile and deploy live automatically!

Run these three commands in your terminal to initialize and deploy:

```bash
# 1. Stage and commit files
git add .
git commit -m "feat: configure serverless storage and automatic github actions deploy"

# 2. Add your remote repository origin link
git remote add origin https://github.com/Smart123-12/finflow.git

# 3. Push your code to GitHub
git push -u origin main
```

### 🚨 Crucial Step: Enable GitHub Actions Permissions
After pushing your code, you need to enable Actions permissions on GitHub to let the automated script deploy:
1. Go to your repository page: `https://github.com/Smart123-12/finflow`.
2. Click **Settings** (tab at the top) $\rightarrow$ **Actions** (under General in left sidebar) $\rightarrow$ **General**.
3. Under **Workflow permissions**:
   - Select **Read and write permissions**.
   - Check **Allow GitHub Actions to create and approve pull requests**.
4. Click **Save**.

Now, go to the **Actions** tab on your GitHub repository page. You will see the build workflow running. Within 60 seconds, it will complete, and your app will be live at:
**`https://smart123-12.github.io/finflow/`**!
