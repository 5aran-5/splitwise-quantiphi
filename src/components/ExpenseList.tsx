import React from "react";
import { Receipt, Calendar, User, Percent, Trash2 } from "lucide-react";
import { Expense } from "../types";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div id="expense-list-container" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h2 id="list-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          Expense History
          <span className="text-xs text-gray-500 font-normal bg-gray-100 px-2.5 py-0.5 rounded-full">
            {expenses.length}
          </span>
        </h2>
      </div>

      {expenses.length === 0 ? (
        <div id="empty-expenses-state" className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <div className="bg-gray-50 p-3 rounded-full mb-2">
            <Receipt className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No expenses added yet</p>
          <p className="text-xs text-gray-400 mt-1">Use the form on the left to add your first shared cost.</p>
        </div>
      ) : (
        <div id="expenses-scroller" className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              id={`expense-card-${expense.id}`}
              className="bg-gray-50/50 border border-gray-150 rounded-xl p-4 hover:border-indigo-100 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-3 group relative"
            >
              {/* Left Group */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {expense.description}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono font-medium flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1 text-gray-700">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Paid by <strong>{expense.payer}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Percent className="w-3.5 h-3.5 text-gray-400" />
                    <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {Object.entries(expense.splits).map(([member, pct]) => {
                        if (pct <= 0) return null;
                        return (
                          <span key={member} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-700">
                            {member}: <span className="text-indigo-600">{pct}%</span>
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Group (Amount & Actions) */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
                <div className="text-left md:text-right">
                  <div className="text-xs text-gray-500 font-medium">Total Amount</div>
                  <div className="text-lg font-bold font-mono text-gray-900">
                    ₹{expense.amount.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => onDelete(expense.id)}
                  id={`delete-btn-${expense.id}`}
                  className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                  title="Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
