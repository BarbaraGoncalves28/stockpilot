from app.db.database import get_db
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.auth.role_dependencies import require_admin
from app.modules.suppliers.supplier_schema import (
    SupplierCreate,
    SupplierListResponse,
    SupplierResponse,
    SupplierUpdate,
)
from app.modules.suppliers.supplier_service import (
    create_supplier,
    delete_supplier,
    get_supplier,
    list_suppliers,
    restore_supplier,
    update_supplier,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
)


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        return create_supplier(db, data)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.get(
    "",
    response_model=SupplierListResponse,
)
def list_all(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, min_length=1),
    is_active: bool | None = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    suppliers, total, total_pages = list_suppliers(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
    )

    return {
        "items": suppliers,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def get_one(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    return supplier


@router.patch(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def update(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    try:
        return update_supplier(
            db,
            supplier,
            data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    try:
        delete_supplier(db, supplier)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.patch(
    "/{supplier_id}/restore",
    response_model=SupplierResponse,
)
def restore(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    supplier = get_supplier(db, supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    if supplier.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplier is already active.",
        )

    return restore_supplier(
        db,
        supplier,
    )


