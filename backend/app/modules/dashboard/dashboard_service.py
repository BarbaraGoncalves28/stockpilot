from collections import defaultdict
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.modules.dashboard.dashboard_schema import (
    DashboardMovementChartItem,
    DashboardSummaryResponse,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def get_dashboard_summary(
    db: Session,
    days: int,
) -> DashboardSummaryResponse:
    period_start = datetime.now(UTC).replace(tzinfo=None) - timedelta(
        days=days,
    )

    total_products = (
        db.scalar(
            select(func.count(Product.id)).where(
                Product.is_active.is_(True),
            )
        )
        or 0
    )

    low_stock_products = (
        db.scalar(
            select(func.count(Product.id)).where(
                Product.is_active.is_(True),
                Product.current_stock > 0,
                Product.current_stock <= Product.min_stock,
            )
        )
        or 0
    )

    out_of_stock_products = (
        db.scalar(
            select(func.count(Product.id)).where(
                Product.is_active.is_(True),
                Product.current_stock <= 0,
            )
        )
        or 0
    )

    total_movements = (
        db.scalar(
            select(func.count(StockMovement.id))
        )
        or 0
    )

    total_entries = (
        db.scalar(
            select(func.coalesce(func.sum(StockMovement.quantity), 0))
            .where(
                StockMovement.movement_type == "IN",
            )
        )
        or 0
    )

    total_exits = (
        db.scalar(
            select(func.coalesce(func.sum(StockMovement.quantity), 0))
            .where(
                StockMovement.movement_type == "OUT",
            )
        )
        or 0
    )

    period_movements = (
        db.scalar(
            select(func.count(StockMovement.id)).where(
                StockMovement.created_at >= period_start,
            )
        )
        or 0
    )

    period_entries = (
        db.scalar(
            select(func.coalesce(func.sum(StockMovement.quantity), 0))
            .where(
                StockMovement.created_at >= period_start,
                StockMovement.movement_type == "IN",
            )
        )
        or 0
    )

    period_exits = (
        db.scalar(
            select(func.coalesce(func.sum(StockMovement.quantity), 0))
            .where(
                StockMovement.created_at >= period_start,
                StockMovement.movement_type == "OUT",
            )
        )
        or 0
    )

    return DashboardSummaryResponse(
        total_products=total_products,
        low_stock_products=low_stock_products,
        out_of_stock_products=out_of_stock_products,
        total_movements=total_movements,
        total_entries=Decimal(total_entries),
        total_exits=Decimal(total_exits),
        period_days=days,
        period_movements=period_movements,
        period_entries=Decimal(period_entries),
        period_exits=Decimal(period_exits),
    )


def get_dashboard_movement_chart(
    db: Session,
    days: int,
) -> list[DashboardMovementChartItem]:
    period_start = datetime.now(UTC).replace(tzinfo=None) - timedelta(
        days=days,
    )

    movements = list(
        db.scalars(
            select(StockMovement)
            .where(
                StockMovement.created_at >= period_start,
                StockMovement.movement_type.in_(
                    ["IN", "OUT"],
                ),
            )
            .order_by(
                StockMovement.created_at.asc(),
            )
        ).all()
    )

    grouped: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {
            "entries": Decimal(0),
            "exits": Decimal(0),
        }
    )

    for movement in movements:
        date_key = movement.created_at.strftime(
            "%Y-%m-%d"
        )

        if movement.movement_type == "IN":
            grouped[date_key]["entries"] += Decimal(
                movement.quantity
            )
        elif movement.movement_type == "OUT":
            grouped[date_key]["exits"] += Decimal(
                movement.quantity
            )

    return [
        DashboardMovementChartItem(
            date=date_key,
            entries=values["entries"],
            exits=values["exits"],
        )
        for date_key, values in sorted(grouped.items())
    ]


