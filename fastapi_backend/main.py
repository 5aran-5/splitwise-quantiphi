from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from fastapi_backend.schemas import (
    ExpenseCreate, 
    ExpenseResponse, 
    SettlementResponse,
    MEMBERS
)
from fastapi_backend import store
from fastapi_backend.services import compute_settlements

app = FastAPI(
    title="Splitwise-Lite Expense Tracker API",
    description="Backend service for tracking shared expenses and computing minimized settlements"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/members", response_model=List[str])
def get_members():
    """
    Returns the fixed list of members.
    """
    return MEMBERS

@app.post("/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate):
    """
    Validates payload, creates a new expense, updates the in-memory ledger, 
    and returns the created expense with the recomputed settlements.
    """
    new_expense = store.add_expense(
        description=payload.description,
        amount=payload.amount,
        payer=payload.payer,
        splits=payload.splits
    )
    
    all_expenses = store.get_all_expenses()
    settlements = compute_settlements(all_expenses)
    
    return {
        "message": "Expense added successfully",
        "expense": new_expense,
        "settlements": settlements
    }

@app.get("/expenses", response_model=List[ExpenseResponse])
def get_expenses():
    """
    Returns a list of all recorded expenses.
    """
    return store.get_all_expenses()

@app.get("/settlements", response_model=SettlementResponse)
def get_settlements():
    """
    Computes and returns the net balances and minimized transactions.
    """
    all_expenses = store.get_all_expenses()
    return compute_settlements(all_expenses)

@app.post("/reset")
def reset_expenses():
    """
    Resets the in-memory database to empty. Useful for live demo.
    """
    store.reset_expenses_store()
    return {"message": "All expenses reset successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
