
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.inventory_owner import resolve_inventory_owner_id
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.auth.role_dependencies import require_admin
from app.modules.products.product_schema import (
    ProductCreate, ProductListResponse, ProductResponse, ProductUpdate,
)
from app.modules.products.product_service import (
    create_product, delete_product, get_product, list_products,
    restore_product, update_product,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create(data: ProductCreate, db: Session = Depends(get_db), current_admin=Depends(require_admin)):
    try:
        return create_product(db, data, owner_id=current_admin.id)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("", response_model=ProductListResponse)
def list_all(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, min_length=1),
    category_id: int | None = Query(None, gt=0),
    supplier_id: int | None = Query(None, gt=0),
    is_active: bool | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total, total_pages = list_products(
        db=db, page=page, page_size=page_size,
        owner_id=resolve_inventory_owner_id(db, current_user), search=search,
        category_id=category_id, supplier_id=supplier_id,
        is_active=is_active,
    )
    return {
        "items": items, "page": page, "page_size": page_size,
        "total": total, "total_pages": total_pages,
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_one(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = get_product(db, product_id, owner_id=resolve_inventory_owner_id(db, current_user))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product


@router.patch("/{product_id}", response_model=ProductResponse)
def update(
    product_id: int, data: ProductUpdate,
    db: Session = Depends(get_db), current_admin=Depends(require_admin),
):
    product = get_product(db, product_id, owner_id=current_admin.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    try:
        return update_product(db, product, data, owner_id=current_admin.id)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    product_id: int, db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    product = get_product(db, product_id, owner_id=current_admin.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    delete_product(db, product)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{product_id}/restore", response_model=ProductResponse)
def restore(
    product_id: int, db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    product = get_product(db, product_id, owner_id=current_admin.id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    if product.is_active:
        raise HTTPException(status_code=400, detail="Product is already active.")
    return restore_product(db, product)
