from app.db.database import get_db
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.auth.role_dependencies import require_admin
from app.modules.products.product_schema import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.modules.products.product_service import (
    create_product,
    delete_product,
    get_product,
    list_products,
    restore_product,
    update_product,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    try:
        return create_product(db, data)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.get(
    "",
    response_model=ProductListResponse,
)
def list_all(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
        min_length=1,
    ),
    category_id: int | None = Query(
        default=None,
        gt=0,
    ),
    supplier_id: int | None = Query(
        default=None,
        gt=0,
    ),
    is_active: bool | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    products, total, total_pages = list_products(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        supplier_id=supplier_id,
        is_active=is_active,
    )

    return {
        "items": products,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_one(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    product = get_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return product


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
)
def update(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    product = get_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    try:
        return update_product(
            db,
            product,
            data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    product = get_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    delete_product(db, product)

@router.patch(
    "/{product_id}/restore",
    response_model=ProductResponse,
)
def restore(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    product = get_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is already active.",
        )

    return restore_product(
        db,
        product,
    )


