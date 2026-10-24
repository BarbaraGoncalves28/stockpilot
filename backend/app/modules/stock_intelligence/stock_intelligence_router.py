
from app.db.database import get_db
from app.core.inventory_owner import resolve_inventory_owner_id
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.stock_intelligence.stock_intelligence_schema import (
    StockAlertItem,
    StockIntelligenceItem,
)
from app.modules.stock_intelligence.stock_intelligence_service import (
    get_stock_intelligence,
    get_stock_intelligence_alerts,
    get_stock_intelligence_product,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/stock-intelligence",
    tags=["Stock Intelligence"],
)


@router.get("", response_model=list[StockIntelligenceItem])
def intelligence(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_stock_intelligence(
        db=db,
        owner_id=resolve_inventory_owner_id(db, current_user),
        days=days,
    )


@router.get("/alerts", response_model=list[StockAlertItem])
def alerts(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_stock_intelligence_alerts(
        db=db,
        owner_id=resolve_inventory_owner_id(db, current_user),
        days=days,
    )


@router.get(
    "/product/{product_id}",
    response_model=StockIntelligenceItem,
)
def product_intelligence(
    product_id: int,
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return get_stock_intelligence_product(
            db=db,
            product_id=product_id,
            owner_id=resolve_inventory_owner_id(db, current_user),
            days=days,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
