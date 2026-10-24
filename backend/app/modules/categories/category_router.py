
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.inventory_owner import resolve_inventory_owner_id
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.auth.role_dependencies import require_admin
from app.modules.categories.category_schema import (
    CategoryCreate, CategoryListResponse, CategoryResponse, CategoryUpdate,
)
from app.modules.categories.category_service import (
    create_category, delete_category, get_category, list_categories,
    restore_category, update_category,
)

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create(data: CategoryCreate, db: Session = Depends(get_db), current_admin=Depends(require_admin)):
    try:
        return create_category(db, data, owner_id=current_admin.id)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("", response_model=CategoryListResponse)
def list_all(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, min_length=1),
    is_active: bool | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total, total_pages = list_categories(
        db=db, page=page, page_size=page_size,
        owner_id=resolve_inventory_owner_id(db, current_user), search=search, is_active=is_active,
    )
    return {
        "items": items, "page": page, "page_size": page_size,
        "total": total, "total_pages": total_pages,
    }


@router.get("/{category_id}", response_model=CategoryResponse)
def get_one(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = get_category(db, category_id, owner_id=resolve_inventory_owner_id(db, current_user))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    return category


@router.patch("/{category_id}", response_model=CategoryResponse)
def update(
    category_id: int, data: CategoryUpdate,
    db: Session = Depends(get_db), current_admin=Depends(require_admin),
):
    category = get_category(db, category_id, owner_id=current_admin.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    try:
        return update_category(db, category, data)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    category_id: int, db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    category = get_category(db, category_id, owner_id=current_admin.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    try:
        delete_category(db, category)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{category_id}/restore", response_model=CategoryResponse)
def restore(
    category_id: int, db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    category = get_category(db, category_id, owner_id=current_admin.id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    if category.is_active:
        raise HTTPException(status_code=400, detail="Category is already active.")
    return restore_category(db, category)


