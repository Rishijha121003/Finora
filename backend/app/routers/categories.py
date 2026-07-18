import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.routers.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Category).filter(
        (Category.user_id == None) | (Category.user_id == current_user.id)
    ).order_by(Category.type.asc(), Category.is_system.desc(), Category.name.asc()).all()
    return categories

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat_id = str(uuid.uuid4())
    category = Category(
        id=cat_id,
        user_id=current_user.id,
        name=category_in.name.strip(),
        type=category_in.type.upper(),
        icon=category_in.icon or "tag",
        color=category_in.color or "#3b82f6",
        is_system=False
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
        
    if category.is_system:
        raise HTTPException(status_code=403, detail="System default categories cannot be modified.")
        
    if category.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to modify this category.")
        
    if category_in.name is not None:
        category.name = category_in.name.strip()
    if category_in.icon is not None:
        category.icon = category_in.icon
    if category_in.color is not None:
        category.color = category_in.color
        
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
        
    if category.is_system:
        raise HTTPException(status_code=403, detail="System default categories cannot be deleted.")
        
    if category.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to delete this category.")
        
    # Reassign transactions to fallback Uncategorized category if needed
    tx_count = db.query(Transaction).filter(Transaction.category_id == category_id).count()
    if tx_count > 0:
        fallback = db.query(Category).filter(
            Category.name == "Uncategorized Expense", Category.is_system == True
        ).first()
        if fallback:
            db.query(Transaction).filter(Transaction.category_id == category_id).update(
                {"category_id": fallback.id}
            )
            
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully."}
