import uuid
from datetime import datetime
from typing import List, Dict
from fastapi_backend.schemas import ExpenseResponse

# In-memory storage of expenses
expenses_db: List[dict] = [
    # Seed with an initial sample expense
    {
        "id": "seed-1",
        "description": "Team Dinner",
        "amount": 1500.0,
        "payer": "Sneha",
        "splits": {
            "Amit": 50.0,
            "Rahul": 30.0,
            "Sneha": 20.0
        },
        "created_at": datetime.now().isoformat()
    }
]

def get_all_expenses() -> List[dict]:
    return expenses_db

def add_expense(description: str, amount: float, payer: str, splits: Dict[str, float]) -> dict:
    new_exp = {
        "id": f"exp-{uuid.uuid4().hex[:6]}",
        "description": description.strip(),
        "amount": float(amount),
        "payer": payer,
        "splits": {m: float(val) for m, val in splits.items()},
        "created_at": datetime.now().isoformat()
    }
    expenses_db.append(new_exp)
    return new_exp

def reset_expenses_store() -> None:
    global expenses_db
    expenses_db.clear()
