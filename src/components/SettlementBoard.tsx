import React from "react";
import { CreditCard, ArrowRight, CheckCircle2, TrendingDown, TrendingUp, Sparkles } from "lucide-react";
import { SettlementData } from "../types";

interface SettlementBoardProps {
  settlementData: SettlementData | null;
  onReset: () => void;
  loading: boolean;
}

export default function SettlementBoard({ settlementData, onReset, loading }: SettlementBoardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const balances = settlementData?.balances || { Amit: 0, Rahul: 0, Sneha: 0 };
  const transactions = settlementData?.transactions || [];

  return (
    <div id="settlement-board-container" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h2 id="board-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          Settlement Board
        </h2>
        <button
          onClick={onReset}
          id="reset-ledger-btn"
          className="text-xs text-rose-600 hover:text-rose-700 font-medium bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
        >
          Reset Ledger
        </button>
      </div>

      {/* Net Balances Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Net Balances
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(balances).map(([member, val]) => {
            const isOwed = val > 0.01;
            const owes = val < -0.01;
            const isSettled = !isOwed && !owes;

            return (
              <div
                key={member}
                id={`balance-card-${member}`}
                className={`rounded-xl p-3 border transition-all ${
                  isOwed
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                    : owes
                    ? "bg-rose-50/40 border-rose-100 text-rose-800"
                    : "bg-gray-50/80 border-gray-200 text-gray-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">{member}</span>
                  {isOwed && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                  {owes && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                  {isSettled && <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                <div className="text-sm font-bold font-mono">
                  {val >= 0 ? "+" : ""}
                  ₹{val.toFixed(2)}
                </div>
                <div className="text-[10px] mt-0.5 text-gray-500 font-medium">
                  {isOwed ? "Gets back" : owes ? "Owes" : "Settled (Even)"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimized Debts Settlement Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Optimized Settlements
        </h3>

        {transactions.length === 0 ? (
          <div
            id="empty-transactions-box"
            className="flex flex-col items-center justify-center bg-emerald-50/20 border border-dashed border-emerald-200 rounded-xl p-6 text-center"
          >
            <div className="bg-emerald-50 p-2 rounded-full mb-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">No debts outstanding!</p>
            <p className="text-xs text-emerald-600 mt-1">Everyone is fully even. All debts are settled.</p>
          </div>
        ) : (
          <div id="transactions-list" className="space-y-2">
            {transactions.map((t, idx) => (
              <div
                key={idx}
                id={`transaction-item-${idx}`}
                className="flex items-center justify-between bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-sm hover:border-gray-200 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                    {t.from}
                  </span>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-medium">owes</span>
                  </div>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                    {t.to}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-gray-900 text-base">
                    ₹{t.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Human-Readable Instructions Summary */}
      {transactions.length > 0 && (
        <div id="narrative-summary" className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100/50 space-y-1.5 text-xs text-indigo-900">
          <span className="font-semibold block text-indigo-950">How to Settle:</span>
          <ul className="list-disc list-inside space-y-1 text-indigo-900">
            {transactions.map((t, idx) => (
              <li key={idx}>
                <strong>{t.from}</strong> pays <strong>₹{t.amount.toFixed(2)}</strong> to <strong>{t.to}</strong>.
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
