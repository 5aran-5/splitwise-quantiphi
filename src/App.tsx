import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, Activity, Info, Check } from "lucide-react";
import { Expense, SettlementData } from "./types";
import ExpenseForm from "./components/ExpenseForm";
import SettlementBoard from "./components/SettlementBoard";
import ExpenseList from "./components/ExpenseList";

export default function App() {
  const [members, setMembers] = useState<string[]>(["Amit", "Rahul", "Sneha"]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Trigger auto-dismissing toast messages
  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Helper to fetch all initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch members, expenses, and settlements in parallel
      const [membersRes, expensesRes, settlementsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/expenses"),
        fetch("/api/settlements"),
      ]);

      if (!membersRes.ok || !expensesRes.ok || !settlementsRes.ok) {
        throw new Error("Failed to load initial data from the full-stack server.");
      }

      const membersData = await membersRes.json();
      const expensesData = await expensesRes.json();
      const settlementsData = await settlementsRes.json();

      setMembers(membersData);
      setExpenses(expensesData);
      setSettlementData(settlementsData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while connecting to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle addition of a new expense
  const handleAddExpense = async (newExpense: {
    description: string;
    amount: number;
    payer: string;
    splits: { [member: string]: number };
  }) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit expense.");
      }

      // Update local state directly with returned server payload
      setExpenses((prev) => [data.expense, ...prev]);
      setSettlementData(data.settlements);
      showToast(`Added "${newExpense.description}" of ₹${newExpense.amount.toFixed(2)} paid by ${newExpense.payer}!`);
      return true;
    } catch (err: any) {
      alert(err.message || "Could not save expense to server.");
      return false;
    }
  };

  // Handle deletion of an expense
  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete expense.");
      }

      // Update state
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setSettlementData(data.settlements);
      showToast("Expense removed successfully.");
    } catch (err: any) {
      alert(err.message || "Could not delete expense from server.");
    }
  };

  // Handle full reset
  const handleResetLedger = async () => {
    if (!window.confirm("Are you sure you want to reset all expenses in the current session?")) {
      return;
    }

    try {
      const response = await fetch("/api/reset", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset ledger on server.");
      }

      setExpenses([]);
      setSettlementData({
        balances: { Amit: 0, Rahul: 0, Sneha: 0 },
        transactions: [],
      });
      showToast("Ledger has been cleared!");
    } catch (err: any) {
      alert(err.message || "Reset failed.");
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-gray-50/70 text-gray-800 antialiased font-sans flex flex-col">
      {/* Toast Notification */}
      {successToast && (
        <div
          id="toast-notification"
          className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-gray-800 flex items-center gap-2 animate-fade-in"
        >
          <div className="bg-emerald-500 text-white rounded-full p-0.5">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Header */}
      <header id="app-header" className="bg-white border-b border-gray-200 py-5 sticky top-0 z-10 shadow-3xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                Splitwise-Lite
              </h1>
              <p className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                Expense Tracker & Settlement Minimizer MVP
              </p>
            </div>
          </div>


        </div>
      </header>

      {/* Main Content Dashboard */}
      <main id="app-main-content" className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Connection Error Banner */}
        {errorMsg && (
          <div id="connection-error-banner" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Connection/Fetch Error</h4>
              <p className="text-xs text-rose-700 mt-1">{errorMsg}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-xs font-semibold text-rose-900 underline hover:no-underline"
              >
                Retry Connecting
              </button>
            </div>
          </div>
        )}

        {/* Workspace Grid splits: Form Left, Settlement Board Right */}
        <div id="grid-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add Expense */}
          <div className="lg:col-span-5">
            <ExpenseForm members={members} onSubmit={handleAddExpense} />
          </div>

          {/* Right: Net Balances & Settlements */}
          <div className="lg:col-span-7">
            <SettlementBoard
              settlementData={settlementData}
              onReset={handleResetLedger}
              loading={loading}
            />
          </div>
        </div>

        {/* Bottom Section: Historical Ledger */}
        <div id="bottom-ledger-section">
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
        </div>
      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-white border-t border-gray-150 py-5 mt-auto text-center text-xs text-gray-500">
        <p>Splitwise-Lite MVP • Developed using React, Express, and FastAPI specifications.</p>
      </footer>
    </div>
  );
}
