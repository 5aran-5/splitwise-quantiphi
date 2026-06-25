from pydantic import BaseModel, Field, field_validator
from typing import Dict, List

# Standard fixed members list
MEMBERS = ["Amit", "Rahul", "Sneha"]

class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, description="Description of the expense")
    amount: float = Field(..., gt=0, description="Total amount of the expense, must be greater than zero")
    payer: str = Field(..., description="The member who paid the expense")
    splits: Dict[str, float] = Field(..., description="The percentage splits for each member")

    @field_validator("payer")
    @classmethod
    def validate_payer(cls, v: str) -> str:
        if v not in MEMBERS:
            raise ValueError(f"Payer must be one of: {', '.join(MEMBERS)}")
        return v

    @field_validator("splits")
    @classmethod
    def validate_splits(cls, v: Dict[str, float]) -> Dict[str, float]:
        # Ensure all 3 members are present
        for m in MEMBERS:
            if m not in v:
                raise ValueError(f"Split percentage for {m} is missing.")
            if v[m] < 0 or v[m] > 100:
                raise ValueError(f"Split percentage for {m} must be between 0 and 100.")
        
        # Ensure the total is exactly 100
        total_pct = sum(v[m] for m in MEMBERS)
        if abs(total_pct - 100.0) > 0.01:
            raise ValueError(f"Split percentages must sum to exactly 100%. Got {total_pct}%.")
            
        return v

class ExpenseResponse(BaseModel):
    id: str
    description: str
    amount: float
    payer: str
    splits: Dict[str, float]
    created_at: str

class SettlementTransaction(BaseModel):
    from_member: str = Field(..., alias="from")
    to_member: str = Field(..., alias="to")
    amount: float

    class Config:
        populate_by_name = True

class SettlementResponse(BaseModel):
    balances: Dict[str, float]
    transactions: List[SettlementTransaction]
