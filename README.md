# 💸 Splitwise-Lite

A lightweight, minimum viable product (MVP) expense tracker designed to simplify shared costs among a small group of friends. Built with a **React + Vite frontend** and a **FastAPI backend**, this project focuses on clean architecture, server-side business logic, and an intuitive user interface.

---

## ✨ Main Features

* **Fixed Group Management:** Pre-configured for a close-knit group (Amit, Rahul, Sneha) for rapid testing and demonstration.
* **Comprehensive Expense Creation:** Easily add expenses by specifying the description, total amount, who paid, and who to include in the split.
* **Advanced & Flexible Splitting:**

  * 🎚️ **Percentage Sliders:** Visually adjust each member's share using intuitive range sliders.
  * 🔢 **Manual Text Entry:** Type exact percentage numbers directly into text fields for precise, decimal-level control.
  * ⚖️ **Split Equally Button:** Instantly distribute the expense evenly among selected members with a single click.
* **Include-Person Dropdown:** Choose exactly which members should be part of a specific expense before calculating the split.
* **Strict Validation:** The **Add Expense** button intelligently disables itself unless the total split equals exactly **100%**. All validation and security checks are enforced on the backend.
* **Debt Minimization:** Uses a greedy settlement algorithm on the backend to simplify balances into the minimum number of human-readable transactions (e.g., *“Amit owes Sneha ₹500”*).
* **Real-time Ledger:** View a live history of all added expenses and current settlement details.

---

## 🛠️ Tech Stack

### Frontend

* **React** (Functional Components & Hooks)
* **Vite** (Frontend build tool and dev server)
* **Vanilla CSS** (Simple, dependency-free styling)
* **Fetch API** (Client-server communication)

### Backend

* **FastAPI** (High-performance Python web framework)
* **Pydantic** (Schema validation and data modeling)
* **In-memory Python data structures** (No external database required for the MVP)

---

## 🚀 Getting Started

Follow these steps to run both the frontend and backend locally.

---

## 1. Run the Backend (FastAPI)

1. Open a terminal and navigate to the backend folder.
2. *(Optional but recommended)* Create and activate a Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**

```powershell
venv\Scripts\activate
```

3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload
```

The backend will start at:

* **API Base URL:** `http://localhost:8000`
* **Swagger Docs:** `http://localhost:8000/docs`

---

## 2. Run the Frontend (React + Vite)

1. Open a **new terminal window**.
2. Navigate to the frontend directory.
3. Install the Node dependencies:

```bash
npm install
```

4. Start the Vite development server:

```bash
npm run dev
```

The frontend will typically run at:

* **Frontend URL:** `http://localhost:5173`

Open this in your browser to interact with the app.

---

## 📡 API Endpoints Overview

All core business logic is handled on the backend to ensure a single source of truth.

### `GET /members`

Fetches the list of active group members.

### `POST /expenses`

Accepts a new expense payload, validates that the split totals **100%**, computes individual shares, and stores the expense record.

### `GET /expenses`

Returns the full history of all recorded expenses.

### `GET /settlements`

Calculates net balances for all members and returns a minimized list of settlement instructions showing who owes whom.

---

## 🧠 Business Logic Notes

* Expense splitting logic is validated on the backend.
* The total percentage split must always equal **100%**.
* Only selected members from the **include-person dropdown** are considered when splitting a particular expense.
* Settlement generation uses a **greedy balancing algorithm** to reduce the number of transactions required.

---

## 📌 MVP Assumptions

* Group members are fixed and hardcoded for the demo.
* Data is stored in memory, so it resets when the backend restarts.
* Authentication and persistent storage are intentionally omitted to keep the project focused on core expense-sharing logic.

---

## 🔮 Possible Future Enhancements

* Persistent database support (PostgreSQL / SQLite)
* Add / edit / remove group members dynamically
* Authentication and user accounts
* Expense categories and filters
* Per-member expense summaries and analytics
* Export settlement history

---

