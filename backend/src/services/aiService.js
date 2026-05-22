let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  console.log('[AI Service] @google/generative-ai not installed or import failed. Using heuristic fallback.');
}

const generateLocalInsights = (stats, budgets, transactions) => {
  const { totalBalance, monthlyIncome, monthlyExpense, monthlySavings, savingsRate } = stats;
  
  const insights = [];
  const suggestions = [];
  
  // 1. Savings Rate Evaluation
  if (monthlyIncome === 0) {
    insights.push("No monthly income recorded yet. Try adding your salary or other revenue sources to kickstart your savings growth tracking!");
    suggestions.push("Log your first income transaction under the 'Income' type.");
  } else if (savingsRate < 0) {
    insights.push(`Your savings rate is currently \x1b[31m${savingsRate.toFixed(1)}%\x1b[0m, meaning you spent $${Math.abs(monthlySavings).toFixed(2)} more than you earned this month. This indicates potential budget creep and high burn-rate.`);
    suggestions.push("Identify non-essential recurring subscriptions and pause them immediately.");
    suggestions.push("Establish a 'cooling off period' of 48 hours for any online purchases over $50.");
  } else if (savingsRate < 15) {
    insights.push(`You have saved $${monthlySavings.toFixed(2)} this month, representing a **${savingsRate.toFixed(1)}% savings rate**. While positive, modern financial planning recommends a benchmark of 20% to build a robust emergency fund.`);
    suggestions.push("Aim to cut down minor miscellaneous expenses (like coffees or snacks) to boost your savings rate to 20%.");
  } else if (savingsRate >= 30) {
    insights.push(`Spectacular job! Your savings rate is a stellar **${savingsRate.toFixed(1)}%** ($${monthlySavings.toFixed(2)} saved). You are in an excellent position to compound your wealth.`);
    suggestions.push("Consider transferring these savings to a High-Yield Savings Account (HYSA) or index funds to beat inflation.");
  } else {
    insights.push(`Solid progress! You are saving **${savingsRate.toFixed(1)}%** of your monthly income. Keeping this up will help you reach your goals ahead of schedule.`);
    suggestions.push("Automate your savings transfers on payday so you 'pay yourself first' before you begin discretionary spending.");
  }

  // 2. Category Ratio Analysis
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryTotals = {};
  let totalSpent = 0;

  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    totalSpent += Number(t.amount);
  });

  // Flag if any single category consumes more than 35% of total expenses
  let heavyCategory = null;
  let heavyPct = 0;
  Object.keys(categoryTotals).forEach(cat => {
    const pct = totalSpent > 0 ? (categoryTotals[cat] / totalSpent) * 100 : 0;
    if (pct > heavyPct) {
      heavyPct = pct;
      heavyCategory = cat;
    }
  });

  if (heavyCategory && heavyPct > 35) {
    insights.push(`Your spending on **${heavyCategory}** accounts for **${heavyPct.toFixed(0)}%** of all outgoing funds ($${categoryTotals[heavyCategory].toFixed(2)}). Trimming this category is your highest leverage path to major savings.`);
    suggestions.push(`Reduce spending on ${heavyCategory} by setting a strict daily limit or cooking at home more frequently.`);
  }

  // 3. Budget Alerts
  const overBudgetCategories = budgets.filter(b => b.alertStatus === 'danger');
  const warningBudgetCategories = budgets.filter(b => b.alertStatus === 'warning');

  if (overBudgetCategories.length > 0) {
    const overNames = overBudgetCategories.map(b => b.category).join(', ');
    insights.push(`⚠️ You have breached your monthly budget limits in the following categories: **${overNames}**. Stop all non-essential spending here.`);
    suggestions.push("Increase budget limits only if the categories are critical necessities, otherwise suspend all discretionary spending.");
  } else if (warningBudgetCategories.length > 0) {
    const warnNames = warningBudgetCategories.map(b => b.category).join(', ');
    insights.push(`🟡 Caution: Spending is approaching limit (>= 85%) for categories: **${warnNames}**.`);
  }

  // General filler suggestions if empty
  if (suggestions.length < 3) {
    suggestions.push("Review transactions every Sunday morning to remain conscious of your financial trajectory.");
    suggestions.push("Create a specific budget category for micro-transactions to catch stealthy spending leaks.");
  }

  return {
    isAI: false,
    headline: savingsRate >= 20 ? "Financially Secure" : (savingsRate >= 0 ? "On Track with Care" : "Action Required"),
    paragraph: insights.join('\n\n'),
    suggestions: suggestions.slice(0, 4)
  };
};

const getAISuggestions = async (stats, budgets, transactions) => {
  const localResult = generateLocalInsights(stats, budgets, transactions);
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey || !GoogleGenerativeAI) {
    console.log('[AI Service] No Gemini API Key or library configured. Returning expert heuristics advisor.');
    return localResult;
  }

  try {
    console.log('[AI Service] Requesting generative response from Google Gemini Pro...');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert personal financial advisor named FinFlow AI.
      Provide a highly sophisticated, engaging, and premium set of actionable insights based on these user finances:
      - Monthly Income: $${stats.monthlyIncome}
      - Monthly Expense: $${stats.monthlyExpense}
      - Net Savings: $${stats.monthlySavings}
      - Savings Rate: ${stats.savingsRate}%
      - Budget Limits configured: ${JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })))}
      - Top 10 Recent transactions: ${JSON.stringify(transactions.slice(0, 10).map(t => ({ amount: t.amount, type: t.type, category: t.category, desc: t.description })))}

      Write in a professional tone similar to visual premium banking services (like Revolut or Wise).
      Your response MUST be valid JSON matching this exact format:
      {
        "headline": "A short, premium 2-4 word status summary (e.g. 'Excellent Wealth Accumulation')",
        "paragraph": "A beautifully drafted 2-3 paragraph overview explaining where the user stands, what they are doing well, analysis of category ratios, savings behaviors, and direct encouragement.",
        "suggestions": [
          "Suggestion 1: Concrete action item with metrics (e.g. 'Decrease food spending by $30')",
          "Suggestion 2...",
          "Suggestion 3..."
        ]
      }
      Do not include any markdown backticks or block formatting in your output outside of the valid JSON string itself.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean up potential markdown formatting wrapping JSON
    const cleanJSONText = responseText
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(cleanJSONText);
    return {
      isAI: true,
      headline: parsed.headline || localResult.headline,
      paragraph: parsed.paragraph || localResult.paragraph,
      suggestions: parsed.suggestions || localResult.suggestions
    };
  } catch (error) {
    console.error('[AI Service] Failed to call Gemini API, falling back to heuristics:', error.message);
    return localResult;
  }
};

module.exports = {
  getAISuggestions
};
