# Finora

> A modern, full-stack Personal Finance Management Platform built for clean cash-flow tracking, strict financial precision, and robust multi-tenant data isolation.

---

## 📌 Project Overview

**Finora** is a full-stack personal finance application developed to provide clear visibility into personal income, expenses, and cash flow dynamics. Built with a responsive Vanilla JavaScript single-page frontend and a RESTful FastAPI backend backed by PostgreSQL, Finora allows users to record financial transactions, manage custom income/expense categories, filter history, and view real-time financial health indicators through an interactive dashboard.

---

## 💡 Problem Finora Solves

Many individuals struggle to maintain clear visibility into when, where, and how their money is spent due to fragmented records or over-complicated banking tools. Finora provides a centralized, private, and precise platform that:
- Captures income and expenses accurately across diverse payment channels (CASH, UPI, CARD, BANK_TRANSFER, OTHER).
- Eliminates floating-point rounding errors by enforcing `Numeric(12,2)` / `Decimal` precision at both database and application layers.
- Offers instant timeframe analysis (Daily, Weekly, Monthly, Yearly, All-Time) to reveal spending habits and net balance trends.
- Keeps personal data isolated and secure through strict user-level data segregation.

---

## 🖼️ Screenshots

*UI previews and application walkthrough screenshots will be added to this section prior to public release.*

---

## ✨ Key Features (v1.0.0)

### 🔐 Authentication & Profile Management
- User Registration with currency preference configuration.
- Secure Login issuing stateless JWT HTTP Bearer tokens.
- Protected API routes requiring token validation via Authorization header.
- User Profile management with currency code switching (INR, USD, EUR, GBP).

### 💳 Transaction Management
- Complete CRUD operations for Income and Expense transactions.
- Fields: Amount, Transaction Type, Category, Date, Payment Method, Note.
- Supported Payment Methods: `CASH`, `UPI`, `CARD`, `BANK_TRANSFER`, `OTHER`.

### 🏷️ Category Management
- Pre-seeded system categories (e.g., Salary, Freelance, Food & Dining, Bills, Utilities).
- Custom Income and Expense category creation with hex color accent pickers.
- Custom category update and safe deletion (re-assigning linked transactions to `Uncategorized Expense`).

### 📊 Dashboard & Analytics
- **Lifetime Current Net Balance**: Always reflects `Lifetime Total Income - Lifetime Total Expenses`.
- **Timeframe Filtering**: Filter stats by Today, Week, Month, Year, or All-Time.
- **Spending Overview Bar Chart**: Responsive visual breakdown of spending across timeframes.
- **Expense Category Breakdown**: Dynamic progress bar visualization of category spending ratios.
- **Recent Transactions Feed**: Quick access to recent activity.

### 🔍 Search & Filtering
- Free-text search across transaction notes and descriptions.
- Dynamic filtering by Date range, Transaction Type (INCOME / EXPENSE), Category, and Payment Method.

### 💰 Financial Precision & Regional Support
- PostgreSQL `Numeric(12, 2)` column types paired with Python `Decimal` data types.
- Default currency set to **INR (₹)** with standard Indian number formatting.
- Native support for popular regional payment methods such as **UPI**.

### 📱 Responsive Design
- Optimized layouts for Desktop (`>= 768px`), Tablet, and Mobile (`< 768px`).
- Fixed Mobile Bottom Navigation Bar (`Dashboard`, `Transactions`, `Categories`).
- Compact Top Mobile Profile Dropdown Menu.
- Dual Transaction rendering: 7-column table on desktop vs compact touch cards on mobile (`< 640px`).

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & Vanilla CSS3**: Custom design system using CSS variables, glassmorphic dark theme, and flexbox/grid.
- **Vanilla JavaScript (ES6 Modules)**: Single-Page Application (SPA) architecture driven by hash routing (`#dashboard`, `#transactions`, `#categories`, `#profile`).
- **Fetch API**: Asynchronous HTTP client wrapping REST endpoints with centralized error handling.

### Backend
- **Python 3.10+**: Core backend runtime.
- **FastAPI**: Modern, fast web framework for building REST APIs.
- **Pydantic v2**: Data validation and response serialization.
- **SQLAlchemy 2.0**: Object-Relational Mapping (ORM) using modern 2.0 select syntax.
- **Alembic**: Database schema migration management.

### Database
- **PostgreSQL**: Production-grade relational database for transaction and user persistence.

### Security
- **JWT (JSON Web Tokens)**: Stateless client authentication via HTTP `Authorization: Bearer <token>` header.
- **bcrypt**: Direct password hashing with automatic salt generation via `python-bcrypt`.

---

## 📐 High-Level Architecture

```text
HTML5 + CSS3 + Vanilla JavaScript (SPA)
              |
              | REST API / JSON (HTTP Bearer JWT)
              v
           FastAPI
              |
              v
       SQLAlchemy 2.0
              |
              v
         PostgreSQL
```

---

## 📁 Project Structure

```text
finora/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   ├── README
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── seed.py
│   │   ├── models/
│   │   │   ├── category.py
│   │   │   ├── transaction.py
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── categories.py
│   │   │   ├── dashboard.py
│   │   │   └── transactions.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── category.py
│   │   │   └── transaction.py
│   │   └── utils/
│   │       └── security.py
│   ├── requirements.txt
│   ├── test_final_v1_release_audit.py
│   ├── test_jwt_secret_startup.py
│   └── test_security_and_regression.py
└── frontend/
    ├── css/
    │   └── style.css
    ├── index.html
    └── js/
        ├── api.js
        ├── app.js
        ├── auth.js
        ├── currency.js
        └── views/
            ├── authView.js
            ├── categoriesView.js
            ├── dashboardView.js
            ├── profileView.js
            └── transactionsView.js
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Python 3.10+**
- **PostgreSQL 14+**
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/finora.git
cd finora
```

---

### 2. PostgreSQL Database Setup
Ensure PostgreSQL service is running on your machine, then create a new database:
```sql
CREATE DATABASE finora_db;
```

---

### 3. Backend Setup & Virtual Environment

Navigate to the `backend` directory, create a Python virtual environment, and install dependencies:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### 4. Environment Variables Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

Open `.env` and configure your local PostgreSQL connection string and a strong JWT secret key:

```env
PROJECT_NAME="Finora Personal Finance API"
VERSION="1.0.0"
API_V1_STR="/api/v1"

# Database Configuration
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/finora_db"

# Mandatory JWT Authentication Secret (Do NOT commit real secrets to Git)
JWT_SECRET="your_secure_random_secret_key_here"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_DAYS=7

# Allowed CORS Origins (Comma-separated)
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

> ⚠️ **IMPORTANT**: Never commit your `.env` file to source control. `.env` is listed in `.gitignore`.

---

### 5. Run Alembic Database Migrations

Apply the database migrations to generate tables in PostgreSQL:

```bash
alembic upgrade head
```

---

### 6. Start the Backend Server

Start the FastAPI application using Uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

---

### 7. Start the Frontend Application

Open a new terminal window, navigate to the repository root or `frontend/` directory, and start a simple static web server:

```bash
cd frontend
python3 -m http.server 3000
```

Open your browser and navigate to:
**`http://localhost:3000`**

---

## 📖 API Documentation

FastAPI automatically generates interactive API documentation. Once the backend is running, access:

- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc**: `http://localhost:8000/api/v1/redoc`
- **OpenAPI Schema**: `http://localhost:8000/api/v1/openapi.json`

---

## 🛣️ Main API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new user account.
- `POST /api/v1/auth/login` — Authenticate and retrieve JWT access token.
- `GET /api/v1/auth/me` — Fetch current user profile.
- `PUT /api/v1/auth/me` — Update user profile and preferred currency.

### 🏷️ Categories (`/api/v1/categories`)
- `GET /api/v1/categories` — List all accessible categories (System + User custom).
- `POST /api/v1/categories` — Create a new custom category.
- `PUT /api/v1/categories/{id}` — Update a custom category.
- `DELETE /api/v1/categories/{id}` — Delete a custom category.

### 💳 Transactions (`/api/v1/transactions`)
- `GET /api/v1/transactions` — Search and filter transactions (supports `search`, `type`, `category_id`, `payment_method`, `start_date`, `end_date`, `page`, `limit`).
- `POST /api/v1/transactions` — Record a new transaction.
- `GET /api/v1/transactions/{id}` — Retrieve details of a specific transaction.
- `PUT /api/v1/transactions/{id}` — Update an existing transaction.
- `DELETE /api/v1/transactions/{id}` — Delete a transaction.

### 📊 Dashboard (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/summary?timeframe={month|today|week|year|all}` — Retrieve dashboard financial metrics, lifetime net balance, category breakdown, spending overview trends, and recent transactions.

---

## 🧪 Automated Testing

The backend includes three comprehensive automated test suites located in `backend/`:

### 1. `backend/test_final_v1_release_audit.py`
- Executable end-to-end regression audit verifying 12 core workflow scenarios.
- Verifies registration, authentication, protected routes, transaction CRUD, monetary `Decimal` precision, search/filtering, category re-assignment safety, multi-user isolation, and database persistence across sessions.

### 2. `backend/test_security_and_regression.py`
- Security-focused test suite.
- Verifies strict CORS origin restrictions, category color hex pattern validation (`#RRGGBB`), and blocks User A from assigning User B's private custom categories (returns HTTP 404).

### 3. `backend/test_jwt_secret_startup.py`
- Startup assertion test.
- Verifies that the FastAPI application starts cleanly when `JWT_SECRET` is configured and halts execution with exit code 1 if `JWT_SECRET` is missing.

To execute the test suites:

```bash
cd backend
python3 test_jwt_secret_startup.py
python3 test_security_and_regression.py
python3 test_final_v1_release_audit.py
```

---

## 🔒 Security Highlights

- **Password Hashing**: Passwords hashed directly using `bcrypt` with salt generation (`bcrypt.hashpw` & `bcrypt.gensalt`).
- **Mandatory Secrets Enforcement**: `JWT_SECRET` is loaded strictly from environment variables via Pydantic `BaseSettings`. Startup fails if missing.
- **Cross-User Data Isolation**: Database queries for transactions and categories enforce `user_id` filtering at the SQL layer. User A cannot view, edit, or link User B's custom categories.
- **CORS Protection**: Restricted to explicitly configured trusted origins (`ALLOWED_ORIGINS`).
- **SQL Injection Defense**: All database operations utilize SQLAlchemy 2.0 parameterized queries.
- **Input Sanitization**: Pydantic v2 schemas strictly validate incoming request payloads.

---

## 📌 Current Version
**v1.0.0** — Initial stable release featuring core financial tracking, PostgreSQL integration, security hardening, and responsive UI.

---

## 🔮 Future Roadmap (Planned Features)

The following features are planned for future iterations:

- 🎯 **Budgeting & Category Spending Limits**: Monthly budget allocation per category with progress alerts.
- 🎯 **Savings Goals**: Goal creation, target dates, and deposit tracking.
- 🎯 **Recurring Transactions & Subscriptions**: Automated scheduling for regular bills and income.
- 🎯 **Multi-Account / Wallet Support**: Managing separate accounts (Cash, Bank, Savings, Cards).
- 🎯 **Data Export**: Exporting transaction history to CSV and Excel.
- 🎯 **Advanced Analytics**: Year-over-year financial reports and exportable charts.
- 🎯 **AI/ML Insights**: Intelligent automated transaction categorization and spending pattern detection.

---

## 🚦 Project Status
**Active Development** — Core v1.0.0 codebase complete and verified locally with PostgreSQL. Pre-release repository hygiene audit passed.

---

## 👨‍💻 Author

**Rishi Jha**  
*B.Tech Computer Science Engineering Student | Backend & Full-Stack Developer*
