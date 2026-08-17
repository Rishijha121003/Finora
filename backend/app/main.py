from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import SessionLocal, engine, Base
import app.models
from app.seed import seed_default_categories
from app.routers import (
    auth,
    categories,
    transactions,
    dashboard,
    feedback,
    budgets,
    favorites,
    accounts,
    transfers,
    pulse,
    goals,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not present & seed default categories
    try:
        Base.metadata.create_all(bind=engine)

        # Ensure Alembic migration state is stamped to current head
        try:
            from alembic.config import Config
            from alembic import command
            import os

            ini_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic.ini")
            if os.path.exists(ini_path):
                alembic_cfg = Config(ini_path)
                command.stamp(alembic_cfg, "head")
        except Exception as alembic_err:
            print("Alembic stamp note:", alembic_err)

        # Schema column auto-migration for existing tables
        try:
            from sqlalchemy import inspect, text
            with engine.connect() as conn:
                inspector = inspect(conn)
                if 'transactions' in inspector.get_table_names():
                    cols = [c['name'] for c in inspector.get_columns('transactions')]
                    if 'account_id' not in cols:
                        conn.execute(text("ALTER TABLE transactions ADD COLUMN account_id VARCHAR(36) REFERENCES accounts(id) ON DELETE RESTRICT"))
                        conn.commit()
                        print("Schema auto-migrated: added account_id column to transactions table")
        except Exception as mig_err:
            print("Schema column auto-migration note:", mig_err)

        db = SessionLocal()
        try:
            seed_default_categories(db)
        finally:
            db.close()
    except Exception as e:
        print("Database connection initialization note:", e)

    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)


# Insecure wildcard CORS fixed (ISSUE-01):
# Restrict allowed origins to configured frontend URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(favorites.router, prefix=settings.API_V1_STR)

app.include_router(accounts.router, prefix=settings.API_V1_STR)
app.include_router(transfers.router, prefix=settings.API_V1_STR)
app.include_router(pulse.router, prefix=settings.API_V1_STR)
app.include_router(goals.router, prefix=settings.API_V1_STR)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Headers"] = "*"
        headers["Access-Control-Allow-Methods"] = "*"

    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)},
        headers=headers,
    )


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "healthy",
    }