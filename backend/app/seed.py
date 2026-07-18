import uuid
from sqlalchemy.orm import Session
from app.models.category import Category

DEFAULT_CATEGORIES = [
    # Income Categories
    {"name": "Salary & Payroll", "type": "INCOME", "icon": "briefcase", "color": "#10b981"},
    {"name": "Freelance & Consulting", "type": "INCOME", "icon": "laptop", "color": "#059669"},
    {"name": "Investments & Dividends", "type": "INCOME", "icon": "trending-up", "color": "#047857"},
    {"name": "Other Income", "type": "INCOME", "icon": "dollar-sign", "color": "#34d399"},
    
    # Expense Categories
    {"name": "Housing & Rent", "type": "EXPENSE", "icon": "home", "color": "#ef4444"},
    {"name": "Groceries & Daily Needs", "type": "EXPENSE", "icon": "shopping-cart", "color": "#f59e0b"},
    {"name": "Utilities & Bills", "type": "EXPENSE", "icon": "zap", "color": "#8b5cf6"},
    {"name": "Transportation & Fuel", "type": "EXPENSE", "icon": "car", "color": "#3b82f6"},
    {"name": "Dining & Food Outings", "type": "EXPENSE", "icon": "coffee", "color": "#ec4899"},
    {"name": "Health & Medical", "type": "EXPENSE", "icon": "activity", "color": "#06b6d4"},
    {"name": "Shopping & Apparel", "type": "EXPENSE", "icon": "shopping-bag", "color": "#d97706"},
    {"name": "Uncategorized Expense", "type": "EXPENSE", "icon": "help-circle", "color": "#64748b"}
]

def seed_default_categories(db: Session):
    existing_count = db.query(Category).filter(Category.is_system == True).count()
    if existing_count == 0:
        for cat_data in DEFAULT_CATEGORIES:
            category = Category(
                id=str(uuid.uuid4()),
                user_id=None,
                name=cat_data["name"],
                type=cat_data["type"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_system=True
            )
            db.add(category)
        db.commit()
        print("Default system categories seeded successfully.")
