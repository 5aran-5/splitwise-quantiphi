from typing import List, Dict, Any

MEMBERS = ["Amit", "Rahul", "Sneha"]

def compute_settlements(expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
    # 1. Initialize balances
    balances = {m: 0.0 for m in MEMBERS}

    # 2. Add credits and debits
    for exp in expenses:
        amount = exp["amount"]
        payer = exp["payer"]
        splits = exp["splits"]

        # Payer gets credited full amount
        balances[payer] += amount

        # Each person gets debited their split share
        for member in MEMBERS:
            percentage = splits.get(member, 0.0)
            share = (percentage / 100.0) * amount
            balances[member] -= share

    # Round balances to 2 decimal places to handle float quirks
    balances = {m: round(balances[m], 2) for m in MEMBERS}

    # 3. Categorize into debtors and creditors
    debtors = []   # elements will be {"member": name, "amount": abs_balance}
    creditors = [] # elements will be {"member": name, "amount": abs_balance}

    for member, bal in balances.items():
        if bal < -0.01:
            debtors.append({"member": member, "amount": -bal})
        elif bal > 0.01:
            creditors.append({"member": member, "amount": bal})

    # Sort descending to settle largest amounts first
    debtors.sort(key=lambda x: x["amount"], reverse=True)
    creditors.sort(key=lambda x: x["amount"], reverse=True)

    transactions = []
    d_idx = 0
    c_idx = 0

    # 4. Greedy match debtor with creditor
    while d_idx < len(debtors) and c_idx < len(creditors):
        debtor = debtors[d_idx]
        creditor = creditors[c_idx]

        settle_amount = min(debtor["amount"], creditor["amount"])
        
        if settle_amount > 0.01:
            transactions.append({
                "from": debtor["member"],
                "to": creditor["member"],
                "amount": round(settle_amount, 2)
            })

        debtor["amount"] -= settle_amount
        creditor["amount"] -= settle_amount

        if debtor["amount"] < 0.01:
            d_idx += 1
        if creditor["amount"] < 0.01:
            c_idx += 1

    return {
        "balances": balances,
        "transactions": transactions
    }
