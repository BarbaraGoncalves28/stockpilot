from collections import defaultdict
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_movement import StockMovement
from zoneinfo import ZoneInfo
from app.modules.dashboard.dashboard_schema import (
    DashboardMovementChartItem,
    DashboardSummaryResponse,
)


def get_dashboard_summary(
    db: Session,
    days: int,
    owner_id: int,
) -> DashboardSummaryResponse:
    now = datetime.now(UTC).replace(tzinfo=None)

    period_start = now - timedelta(days=days)
    month_start = now.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )
    week_start = (
        now.replace(hour=0, minute=0, second=0, microsecond=0)
        - timedelta(days=now.weekday())
    )

    owned_active_products = (
        Product.owner_id == owner_id,
        Product.is_active.is_(True),
    )

    owned_movements = StockMovement.product.has(
        Product.owner_id == owner_id
    )

    total_products = db.scalar(
        select(func.count(Product.id)).where(
            *owned_active_products,
        )
    ) or 0

    low_stock_products = db.scalar(
        select(func.count(Product.id)).where(
            *owned_active_products,
            Product.current_stock > 0,
            Product.current_stock <= Product.min_stock,
        )
    ) or 0

    out_of_stock_products = db.scalar(
        select(func.count(Product.id)).where(
            *owned_active_products,
            Product.current_stock <= 0,
        )
    ) or 0

    total_movements = db.scalar(
        select(func.count(StockMovement.id)).where(
            owned_movements,
        )
    ) or 0

    total_entries = db.scalar(
        select(func.coalesce(func.sum(StockMovement.quantity), 0))
        .where(
            owned_movements,
            StockMovement.movement_type == "IN",
        )
    ) or 0

    total_exits = db.scalar(
        select(func.coalesce(func.sum(StockMovement.quantity), 0))
        .where(
            owned_movements,
            StockMovement.movement_type == "OUT",
        )
    ) or 0

    period_movements = db.scalar(
        select(func.count(StockMovement.id)).where(
            owned_movements,
            StockMovement.created_at >= period_start,
        )
    ) or 0

    period_entries = db.scalar(
        select(func.coalesce(func.sum(StockMovement.quantity), 0))
        .where(
            owned_movements,
            StockMovement.created_at >= period_start,
            StockMovement.movement_type == "IN",
        )
    ) or 0

    period_exits = db.scalar(
        select(func.coalesce(func.sum(StockMovement.quantity), 0))
        .where(
            owned_movements,
            StockMovement.created_at >= period_start,
            StockMovement.movement_type == "OUT",
        )
    ) or 0

    # Calcula o percentual do valor médio do estoque consumido
# pelas saídas registradas no período.
# O primeiro previous_stock representa o estoque inicial
# de cada produto movimentado dentro do período.
# O cálculo utiliza o custo atual dos produtos como referência.
    active_products = list(
        db.scalars(
            select(Product).where(
                Product.owner_id == owner_id,
                Product.is_active.is_(True),
            )
        ).all()
    )

    products_by_id = {
        product.id: product
        for product in active_products
    }

    initial_stock_by_product = {}
    period_exit_cost = Decimal("0")

    period_stock_movements = list(
        db.scalars(
            select(StockMovement)
            .join(Product, Product.id == StockMovement.product_id)
            .where(
                Product.owner_id == owner_id,
                Product.is_active.is_(True),
                StockMovement.created_at >= period_start,
                StockMovement.created_at <= now,
            )
            .order_by(
                StockMovement.created_at.asc(),
                StockMovement.id.asc(),
            )
        ).all()
    )

    for movement in period_stock_movements:
        product = products_by_id.get(movement.product_id)

        if product is None:
            continue

        if movement.product_id not in initial_stock_by_product:
            initial_stock_by_product[movement.product_id] = Decimal(
                movement.previous_stock
            )

        if movement.movement_type == "OUT":
            period_exit_cost += (
                Decimal(movement.quantity) * Decimal(product.cost_price)
            )

    initial_inventory_value = Decimal("0")
    current_inventory_value = Decimal("0")

    for product in active_products:
        initial_stock = initial_stock_by_product.get(
            product.id,
            Decimal(product.current_stock),
        )

        cost_price = Decimal(product.cost_price)

        initial_inventory_value += initial_stock * cost_price
        current_inventory_value += (
            Decimal(product.current_stock) * cost_price
        )

    average_inventory_value = (
        initial_inventory_value + current_inventory_value
    ) / Decimal("2")

    stock_turnover_rate = (
        (period_exit_cost / average_inventory_value) * Decimal("100")
        if average_inventory_value > 0
        else Decimal("0")
    )

    period_balance = Decimal(period_entries) - Decimal(period_exits)

    monthly_products = db.scalar(
        select(func.count(Product.id)).where(
            *owned_active_products,
            Product.created_at >= month_start,
            Product.created_at <= now,
        )
    ) or 0

    monthly_movements = db.scalar(
        select(func.count(StockMovement.id)).where(
            owned_movements,
            StockMovement.created_at >= month_start,
            StockMovement.created_at <= now,
        )
    ) or 0

    weekly_low_stock_products = db.scalar(
        select(func.count(func.distinct(StockMovement.product_id)))
        .select_from(StockMovement)
        .join(Product, Product.id == StockMovement.product_id)
        .where(
            Product.owner_id == owner_id,
            Product.is_active.is_(True),
            StockMovement.created_at >= week_start,
            StockMovement.created_at <= now,
            StockMovement.new_stock > 0,
            StockMovement.new_stock <= Product.min_stock,
            (
                (StockMovement.previous_stock > Product.min_stock)
                | (StockMovement.previous_stock <= 0)
            ),
        )
    ) or 0

    weekly_out_of_stock_products = db.scalar(
        select(func.count(func.distinct(StockMovement.product_id)))
        .select_from(StockMovement)
        .join(Product, Product.id == StockMovement.product_id)
        .where(
            Product.owner_id == owner_id,
            Product.is_active.is_(True),
            StockMovement.created_at >= week_start,
            StockMovement.created_at <= now,
            StockMovement.previous_stock > 0,
            StockMovement.new_stock <= 0,
        )
    ) or 0

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
        period_balance=period_balance,
        stock_turnover_rate=stock_turnover_rate,
        monthly_products=monthly_products,
        weekly_low_stock_products=weekly_low_stock_products,
        weekly_out_of_stock_products=weekly_out_of_stock_products,
        monthly_movements=monthly_movements,
    )


def get_dashboard_movement_chart(
    db: Session,
    days: int,
    owner_id: int,
) -> list[DashboardMovementChartItem]:
    period_start = (
        datetime.now(UTC).replace(tzinfo=None)
        - timedelta(days=days)
    )

    movements = list(
        db.scalars(
            select(StockMovement)
            .where(
                StockMovement.product.has(
                    Product.owner_id == owner_id
                ),
                StockMovement.created_at >= period_start,
                StockMovement.movement_type.in_(["IN", "OUT"]),
            )
            .order_by(StockMovement.created_at.asc())
        ).all()
    )

    grouped: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {
            "entries": Decimal(0),
            "exits": Decimal(0),
        }
    )

    local_timezone = ZoneInfo("America/Sao_Paulo")

    for movement in movements:
        local_created_at = (
            movement.created_at
            .replace(tzinfo=UTC)
            .astimezone(local_timezone)
        )
        date_key = local_created_at.strftime("%Y-%m-%d")

        if movement.movement_type == "IN":
            grouped[date_key]["entries"] += Decimal(movement.quantity)
        elif movement.movement_type == "OUT":
            grouped[date_key]["exits"] += Decimal(movement.quantity)

    return [
        DashboardMovementChartItem(
            date=date_key,
            entries=values["entries"],
            exits=values["exits"],
        )
        for date_key, values in sorted(grouped.items())
    ]
