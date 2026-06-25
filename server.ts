import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Fixed list of members
const MEMBERS = ["Amit", "Rahul", "Sneha"];

interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  splits: {
    [key: string]: number;
  };
  createdAt: string;
}

// In-memory data store
let expenses: Expense[] = [
  // Seed with an initial sample expense for realistic UI on first load
  {
    id: "seed-1",
    description: "Team Dinner",
    amount: 1500,
    payer: "Sneha",
    splits: {
      Amit: 50,
      Rahul: 30,
      Sneha: 20,
    },
    createdAt: new Date().toISOString(),
  }
];

// Validation Helper
function validateExpensePayload(payload: any): string | null {
  if (!payload.description || typeof payload.description !== "string" || payload.description.trim() === "") {
    return "Description must be a non-empty string.";
  }
  const amount = Number(payload.amount);
  if (isNaN(amount) || amount <= 0) {
    return "Amount must be a positive number greater than zero.";
  }
  if (!MEMBERS.includes(payload.payer)) {
    return `Payer must be one of: ${MEMBERS.join(", ")}.`;
  }
  if (!payload.splits || typeof payload.splits !== "object") {
    return "Splits must be an object representing the percentage split for each member.";
  }

  for (const m of MEMBERS) {
    if (payload.splits[m] === undefined) {
      return `Split percentage for ${m} is missing.`;
    }
    const pct = Number(payload.splits[m]);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return `Split percentage for ${m} must be between 0 and 100.`;
    }
  }

  let sum = 0;
  for (const m of MEMBERS) {
    sum += Number(payload.splits[m]);
  }

  if (Math.abs(sum - 100) > 0.01) {
    return `The sum of split percentages must be exactly 100%. Got ${sum}%.`;
  }

  return null;
}

// Settlement calculation logic (Greedy Debt Minimization)
function computeSettlements(expenseList: Expense[]) {
  const balances: { [key: string]: number } = {};
  for (const member of MEMBERS) {
    balances[member] = 0;
  }

  // 1. Calculate net balance for each member
  for (const exp of expenseList) {
    const amount = exp.amount;
    const payer = exp.payer;

    // Payer is credited with the full amount paid
    balances[payer] += amount;

    // Each member gets debited by their own share
    for (const member of MEMBERS) {
      const percentage = exp.splits[member] || 0;
      const share = (percentage / 100) * amount;
      balances[member] -= share;
    }
  }

  // Round balances to 2 decimal places to avoid floating point precision issues
  for (const member of MEMBERS) {
    balances[member] = Math.round(balances[member] * 100) / 100;
  }

  // 2. Separate into debtors and creditors
  const debtors: { member: string; amount: number }[] = [];
  const creditors: { member: string; amount: number }[] = [];

  for (const member of MEMBERS) {
    const bal = balances[member];
    if (bal < -0.01) {
      debtors.push({ member, amount: -bal });
    } else if (bal > 0.01) {
      creditors.push({ member, amount: bal });
    }
  }

  // Sort descending by outstanding amount to settle largest debts/credits first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: { from: string; to: string; amount: number }[] = [];

  let dIdx = 0;
  let cIdx = 0;

  // 3. Match debtors and creditors greedily
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      transactions.push({
        from: debtor.member,
        to: creditor.member,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) {
      dIdx++;
    }
    if (creditor.amount < 0.01) {
      cIdx++;
    }
  }

  return {
    balances,
    transactions,
  };
}

// API Route Handlers

// 1) GET /api/members
app.get("/api/members", (req, res) => {
  res.json(MEMBERS);
});

// 2) POST /api/expenses
app.post("/api/expenses", (req, res) => {
  const errorMsg = validateExpensePayload(req.body);
  if (errorMsg) {
    res.status(400).json({ error: errorMsg });
    return;
  }

  const { description, amount, payer, splits } = req.body;

  const newExpense: Expense = {
    id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    description: description.trim(),
    amount: Number(amount),
    payer,
    splits: {
      Amit: Number(splits.Amit),
      Rahul: Number(splits.Rahul),
      Sneha: Number(splits.Sneha),
    },
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);

  const updatedSettlements = computeSettlements(expenses);

  res.status(201).json({
    message: "Expense added successfully",
    expense: newExpense,
    settlements: updatedSettlements,
  });
});

// 3) GET /api/expenses
app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});

// 4) GET /api/settlements
app.get("/api/settlements", (req, res) => {
  const settlements = computeSettlements(expenses);
  res.json(settlements);
});

// Extra: DELETE /api/expenses/:id - Allows users to delete an expense
app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);

  if (expenses.length === initialLength) {
    res.status(404).json({ error: "Expense not found." });
    return;
  }

  const updatedSettlements = computeSettlements(expenses);
  res.json({
    message: "Expense deleted successfully",
    settlements: updatedSettlements,
  });
});

// Extra: POST /api/reset - Allows clearing the list for easier interview demonstration
app.post("/api/reset", (req, res) => {
  expenses = [];
  res.json({ message: "All expenses reset successfully." });
});

// Vite Middleware & SPA Static Files Configuration
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start server:", err);
});
