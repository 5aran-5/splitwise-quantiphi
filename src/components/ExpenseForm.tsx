import React, { useState, useEffect } from "react";
import { PlusCircle, HelpCircle, RefreshCw, X } from "lucide-react";

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
  const [includedMembers, setIncludedMembers] = useState<string[]>(["Amit", "Rahul", "Sneha"]);
  const [splits, setSplits] = useState<{ [member: string]: number }>({
    Amit: 33.34,
    Rahul: 33.33,
    Sneha: 33.33,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to split 100% equally among selected members
  const performEqualSplit = (included: string[]) => {
    const n = included.length;
    if (n === 0) return {};

    const newSplits: { [member: string]: number } = {};
    
    // Set excluded members to 0%
    members.forEach((m) => {
      newSplits[m] = 0;
    });

    // Divide 100% equally using basis points for precision
    const basePct = Math.floor(10000 / n); // 100.00% / n
    const remainderPct = 10000 % n;

    included.forEach((m, idx) => {
      const pctCents = basePct + (idx < remainderPct ? 1 : 0);
      newSplits[m] = pctCents / 100; // e.g. 33.34, 33.33, 33.33
    });

    return newSplits;
  };

  // Compute live sum of percentages
  const sumOfSliders = (Object.values(splits) as number[]).reduce((sum, val) => sum + val, 0);
  const isValidSum = Math.abs(sumOfSliders - 100) < 0.05; // Slightly lax tolerance to accommodate input decimals

  const handleSliderChange = (member: string, value: number) => {
    setSplits((prev) => ({
      ...prev,
      [member]: value,
    }));
  };

  const handleSplitEqually = () => {
    const newSplits = performEqualSplit(includedMembers);
    setSplits(newSplits);
  };

  const handleToggleMember = (member: string) => {
    setIncludedMembers((prev) => {
      let next: string[];
      if (prev.includes(member)) {
        if (prev.length <= 1) {
          return prev; // must have at least one member
        }
        next = prev.filter((m) => m !== member);
      } else {
        next = [...prev, member];
      }

      // Auto re-split equally for the new set of included members
      const newSplits = performEqualSplit(next);
      setSplits(newSplits);

      return next;
    });
  };

  const handleAmountChange = (newAmtStr: string) => {
    setAmount(newAmtStr);
    const amtNum = parseFloat(newAmtStr) || 0;

    // If splits are currently split equally, keep them split equally
    const includedValues = includedMembers.map((m) => splits[m] || 0);
    const minVal = Math.min(...includedValues);
    const maxVal = Math.max(...includedValues);
    const isCloseToEqual = includedMembers.length > 0 && (maxVal - minVal) <= 0.05;

    if (isCloseToEqual && includedMembers.length > 0) {
      const newSplits = performEqualSplit(includedMembers);
      setSplits(newSplits);
    }
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

    if (includedMembers.length === 0) {
      setErrorMsg("At least one member must be included in the split.");
      return;
    }

    if (!isValidSum) {
      setErrorMsg(`Splits must sum to exactly 100%. Currently it is ${sumOfSliders.toFixed(2)}%.`);
      return;
    }

    setSubmitting(true);
    const success = await onSubmit({
      description: description.trim(),
      amount: amtNum,
      payer,
      splits,
    });

    setSubmitting(true);
    if (success) {
      setDescription("");
      setAmount("");
      setErrorMsg(null);
      // Reset splits to default equal
      const defaultSplits = performEqualSplit(["Amit", "Rahul", "Sneha"]);
      setSplits(defaultSplits);
      setIncludedMembers(["Amit", "Rahul", "Sneha"]);
    }
    setSubmitting(false);
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
              onChange={(e) => handleAmountChange(e.target.value)}
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

        {/* Option: Who all to be included in this split */}
        <div>
          <label htmlFor="select-include-member" className="block text-xs font-medium text-gray-700 mb-1">
            Include in Split (Select to Add/Remove)
          </label>
          <select
            id="select-include-member"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleToggleMember(e.target.value);
              }
            }}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
          >
            <option value="" disabled>+ Choose / Toggle a member...</option>
            {members.map((member) => {
              const isIncluded = includedMembers.includes(member);
              return (
                <option key={member} value={member}>
                  {member} {isIncluded ? "✓ (Included - Click to Exclude)" : "  (Excluded - Click to Include)"}
                </option>
              );
            })}
          </select>

          {/* Selected members list underneath */}
          <div className="mt-2.5">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Currently Included:</span>
            <div id="included-members-list" className="flex gap-2 flex-wrap">
              {members.map((member) => {
                const isIncluded = includedMembers.includes(member);
                if (!isIncluded) return null;
                return (
                  <button
                    key={member}
                    type="button"
                    id={`btn-include-${member}`}
                    onClick={() => handleToggleMember(member)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                    title={`Click to exclude ${member}`}
                  >
                    <span>{member}</span>
                    <X className="w-3 h-3 text-indigo-400 group-hover:text-rose-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Percentage Sliders Section */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
          <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            Split Percentages
          </span>

          {members.map((member) => {
            const isIncluded = includedMembers.includes(member);
            const amtNum = parseFloat(amount) || 0;
            const memberShare = amtNum > 0 ? ((splits[member] || 0) / 100) * amtNum : 0;

            return (
              <div key={member} id={`slider-group-${member}`} className={`space-y-1.5 transition-opacity ${!isIncluded ? "opacity-45" : ""}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700 flex items-center gap-1.5">
                    {member}
                    {isIncluded && amtNum > 0 && (
                      <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        ₹{memberShare.toFixed(2)}
                      </span>
                    )}
                  </span>
                  
                  {/* Percentage Input box (Requirement 3: Editable text/number value box) */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      id={`input-percentage-${member}`}
                      value={splits[member] !== undefined ? splits[member] : 0}
                      disabled={!isIncluded}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleSliderChange(member, isNaN(val) ? 0 : val);
                      }}
                      className="font-mono font-bold text-gray-900 bg-white w-20 px-1.5 py-0.5 rounded-lg border border-gray-200 shadow-2xs text-right text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    />
                    <span className="text-gray-500 font-semibold text-xs">%</span>
                  </div>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.01"
                  value={splits[member] || 0}
                  disabled={!isIncluded}
                  onChange={(e) => handleSliderChange(member, parseFloat(e.target.value) || 0)}
                  id={`slider-${member}`}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            );
          })}

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
                {sumOfSliders.toFixed(2)}%
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
              The sum of percentages must be exactly <b>100%</b> (currently it is <b>{sumOfSliders.toFixed(2)}%</b>).
              Adjust sliders/inputs or click "Split Equally".
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
