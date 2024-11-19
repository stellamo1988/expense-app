from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import random

app = FastAPI()

# Transaction Model
class Transaction(BaseModel):
    id: int
    text: str
    amount: float

# In-memory storage for transactions
transactions: List[Transaction] = []

@app.post("/transactions", response_model=Transaction)
def create_transaction(transaction: Transaction):
    """
    Add a new transaction
    """
    if not transaction.text or transaction.text.strip() == '':
        raise HTTPException(status_code=400, detail="Transaction text cannot be empty")
    
    if transaction.id is None:
        transaction.id = generate_id()
    
    transactions.append(transaction)
    return transaction

@app.get("/transactions", response_model=List[Transaction])
def get_transactions():
    """
    Retrieve all transactions
    """
    return transactions

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int):
    """
    Remove a transaction by ID
    """
    global transactions
    initial_length = len(transactions)
    transactions = [t for t in transactions if t.id != transaction_id]
    
    if len(transactions) == initial_length:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {"message": "Transaction deleted successfully"}

@app.get("/summary")
def get_financial_summary():
    """
    Calculate financial summary
    """
    if not transactions:
        return {
            "total": 0,
            "income": 0,
            "expense": 0
        }
    
    amounts = [t.amount for t in transactions]
    
    total = sum(amounts)
    income = sum(amount for amount in amounts if amount > 0)
    expense = sum(amount for amount in amounts if amount < 0) * -1
    
    return {
        "total": round(total, 2),
        "income": round(income, 2),
        "expense": round(expense, 2)
    }

def generate_id():
    """
    Generate a random unique ID
    """
    while True:
        new_id = random.randint(1, 100000000)
        if not any(transaction.id == new_id for transaction in transactions):
            return new_id

# Optional: Add CORS middleware if needed
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)