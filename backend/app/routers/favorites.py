import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.favorite import FavoriteTransaction
from app.models.category import Category
from app.models.user import User
from app.schemas.favorite import FavoriteCreate, FavoriteUpdate, FavoriteResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[FavoriteResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(FavoriteTransaction, Category).join(
        Category, FavoriteTransaction.category_id == Category.id
    ).filter(
        FavoriteTransaction.user_id == current_user.id
    ).order_by(FavoriteTransaction.created_at.asc()).all()

    response = []
    for fav, cat in results:
        response.append(
            FavoriteResponse(
                id=fav.id,
                user_id=fav.user_id,
                name=fav.name,
                amount=fav.amount,
                type=fav.type,
                category_id=fav.category_id,
                category_name=cat.name if cat else "Uncategorized",
                category_icon=cat.icon if cat else "tag",
                category_color=cat.color if cat else "#3b82f6",
                payment_method=fav.payment_method,
                note=fav.note,
                created_at=fav.created_at
            )
        )
    return response

@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def create_favorite(
    fav_in: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(FavoriteTransaction).filter(
        FavoriteTransaction.user_id == current_user.id
    ).count()
    if count >= 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 6 quick-add favorites allowed per user."
        )

    cat = db.query(Category).filter(Category.id == fav_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    if cat.user_id and cat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized category selection.")

    fav_id = str(uuid.uuid4())
    fav = FavoriteTransaction(
        id=fav_id,
        user_id=current_user.id,
        name=fav_in.name.strip(),
        amount=fav_in.amount,
        type=fav_in.type.upper(),
        category_id=fav_in.category_id,
        payment_method=fav_in.payment_method.upper(),
        note=fav_in.note.strip() if fav_in.note else None
    )

    db.add(fav)
    db.commit()
    db.refresh(fav)

    return FavoriteResponse(
        id=fav.id,
        user_id=fav.user_id,
        name=fav.name,
        amount=fav.amount,
        type=fav.type,
        category_id=fav.category_id,
        category_name=cat.name,
        category_icon=cat.icon,
        category_color=cat.color,
        payment_method=fav.payment_method,
        note=fav.note,
        created_at=fav.created_at
    )

@router.put("/{favorite_id}", response_model=FavoriteResponse)
def update_favorite(
    favorite_id: str,
    fav_in: FavoriteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = db.query(FavoriteTransaction).filter(
        FavoriteTransaction.id == favorite_id,
        FavoriteTransaction.user_id == current_user.id
    ).first()

    if not fav:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite transaction not found.")

    if fav_in.category_id:
        cat = db.query(Category).filter(Category.id == fav_in.category_id).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        if cat.user_id and cat.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized category selection.")
        fav.category_id = fav_in.category_id

    if fav_in.name is not None:
        fav.name = fav_in.name.strip()
    if fav_in.amount is not None:
        fav.amount = fav_in.amount
    if fav_in.type is not None:
        fav.type = fav_in.type.upper()
    if fav_in.payment_method is not None:
        fav.payment_method = fav_in.payment_method.upper()
    if fav_in.note is not None:
        fav.note = fav_in.note.strip() if fav_in.note else None

    db.commit()
    db.refresh(fav)

    cat = db.query(Category).filter(Category.id == fav.category_id).first()
    return FavoriteResponse(
        id=fav.id,
        user_id=fav.user_id,
        name=fav.name,
        amount=fav.amount,
        type=fav.type,
        category_id=fav.category_id,
        category_name=cat.name if cat else "Uncategorized",
        category_icon=cat.icon if cat else "tag",
        category_color=cat.color if cat else "#3b82f6",
        payment_method=fav.payment_method,
        note=fav.note,
        created_at=fav.created_at
    )

@router.delete("/{favorite_id}", status_code=status.HTTP_200_OK)
def delete_favorite(
    favorite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = db.query(FavoriteTransaction).filter(
        FavoriteTransaction.id == favorite_id,
        FavoriteTransaction.user_id == current_user.id
    ).first()

    if not fav:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite transaction not found.")

    db.delete(fav)
    db.commit()
    return {"message": "Favorite deleted successfully."}
