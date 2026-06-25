import React, { useState, useEffect } from "react";
import { PlusCircle, HelpCircle, RefreshCw } from "lucide-react";

interface ExpenseFormProps {
  members: string[];
  onSubmit: (expenseData: {
    description: string;
    amount: number;
    payer: string;
    splits: { [member: string]: number };
  }) => Promise<boolean>;
}

export default function ExpenseForm({ members, onSubmit }: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("Sneha");
  const [splits, setSplits] = useState<{ [member: string]: number }>({
    Amit: 34,
    Rahul: 33,
    Sneha: 33,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute live sum of percentages
  const sumOfSliders = (Object.values(splits) as number[]).reduce((sum, val) => sum + val, 0);
  const isValidSum = Math.abs(sumOfSliders - 100) < 0.01;

  const handleSliderChange = (member: string, value: number) => {
    setSplits((prev) => ({
      ...prev,
      [member]: value,
    }));
  };

  const handleSplitEqually = () => {
    // 34, 33, 33 sums to exactly 100
    setSplits({
      Amit: 34,
      Rahul: 33,
      Sneha: 33,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Frontend validations
    if (!description.trim()) {
      setErrorMsg("Please enter a description.");
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0.");
      return;
    }

    if (!isValidSum) {
      setErrorMsg(`Splits must sum to exactly 100%. Currently it is ${sumOfSliders}%.`);
      return;
    }

    setSubmitting(true);
    const success = await onSubmit({
      description: description.trim(),
      amount: amtNum,
      payer,
      splits,
    });

    setSubmitting(false);
    if (success) {
      setDescription("");
      setAmount("");
      setErrorMsg(null);
    }
  };

  return (
    <div id="expense-form-container" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 id="form-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          Add Shared Expense
        </h2>
        <button
          type="button"
          onClick={handleSplitEqually}
          id="split-equal-btn"
          className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          title="Set percentages to 34%, 33%, 33% to equal exactly 100%"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Split Equally
        </button>
      </div>

      <form onSubmit={handleSubmit} id="expense-form" className="space-y-4">
        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner, Uber ride, Groceries"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            required
          />
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-gray-700 mb-1">
            Total Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-medium text-gray-900"
              required
            />
          </div>
        </div>

        {/* Payer Dropdown */}
        <div>
          <label htmlFor="payer" className="block text-xs font-medium text-gray-700 mb-1">
            Who Paid?
          </label>
          <select
            id="payer"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            {members.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Percentage Sliders Section */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
          <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Split Percentages
          </span>

          {members.map((member) => (
            <div key={member} id={`slider-group-${member}`} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-700">{member}</span>
                <span className="font-mono font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                  {splits[member]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={splits[member]}
                onChange={(e) => handleSliderChange(member, parseInt(e.target.value) || 0)}
                id={`slider-${member}`}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
            </div>
          ))}

          {/* Sum Validator Display */}
          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
            <span className="text-xs text-gray-600">Total Percentage:</span>
            <div className="flex items-center gap-1.5">
              <span
                id="percent-total"
                className={`font-mono text-sm font-bold px-2 py-0.5 rounded-full ${
                  isValidSum
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {sumOfSliders}%
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div id="form-error-alert" className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
            {errorMsg}
          </div>
        )}

        {/* Warning Indicator if Sum of sliders != 100 */}
        {!isValidSum && (
          <div id="validation-warning-box" className="text-xs text-amber-700 bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              The sum of percentages must be exactly <b>100%</b> (currently it is <b>{sumOfSliders}%</b>).
              Adjust sliders or click "Split Equally".
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="add-expense-submit"
          disabled={!isValidSum || submitting}
          className={`w-full py-2.5 px-4 text-sm font-semibold rounded-xl shadow-xs transition duration-200 ${
            isValidSum && !submitting
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-98"
              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
        >
          {submitting ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
