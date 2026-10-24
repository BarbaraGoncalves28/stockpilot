
from datetime import date, datetime, time, timedelta

from app.db.database import get_db
from app.core.inventory_owner import resolve_inventory_owner_id
from app.modules.auth.role_dependencies import require_admin
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.stock_movements.stock_movement_schema import (
    StockMovementCreate,
    StockMovementListResponse,
    StockMovementResponse,
)
from app.modules.stock_movements.stock_movement_service import (
    create_stock_movement,
    list_movements,
    list_product_movements,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/stock-movements",
    tags=["Stock Movements"],
)


@router.post(
    "",
    response_model=StockMovementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: StockMovementCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return create_stock_movement(
        db=db,
        data=data,
        user_id=current_admin.id,
        owner_id=current_admin.id,
    )


@router.get(
    "",
    response_model=StockMovementListResponse,
)
def list_all(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    product_id: int | None = Query(default=None, gt=0),
    movement_type: str | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if movement_type is not None:
        movement_type = movement_type.strip().upper()

        if movement_type not in {"IN", "OUT", "ADJUSTMENT"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="movement_type must be IN, OUT or ADJUSTMENT.",
            )

    if (
        start_date is not None
        and end_date is not None
        and start_date > end_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before or equal to end_date.",
        )

    start_datetime = (
        datetime.combine(start_date, time.min)
        if start_date is not None
        else None
    )

    end_datetime = (
        datetime.combine(end_date + timedelta(days=1), time.min)
        if end_date is not None
        else None
    )

    try:
        movements, total, total_pages = list_movements(
            db=db,
            owner_id=resolve_inventory_owner_id(db, current_user),
            page=page,
            page_size=page_size,
            product_id=product_id,
            movement_type=movement_type,
            start_date=start_datetime,
            end_date=end_datetime,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return {
        "items": movements,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get(
    "/product/{product_id}",
    response_model=list[StockMovementResponse],
)
def list_by_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return list_product_movements(
            db=db,
            product_id=product_id,
            owner_id=resolve_inventory_owner_id(db, current_user),
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
