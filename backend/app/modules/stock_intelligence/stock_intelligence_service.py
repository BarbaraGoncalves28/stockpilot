from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.modules.stock_intelligence.stock_intelligence_schema import (
    StockAlertItem,
    StockIntelligenceItem,
)


def calculate_average_daily_consumption(
    db: Session,
    product_id: int,
    owner_id: int,
    days: int = 30,
) -> Decimal:
    period_start = (
        datetime.now(UTC).replace(tzinfo=None)
        - timedelta(days=days)
    )

    total_consumption = db.scalar(
        select(func.coalesce(func.sum(StockMovement.quantity), 0))
        .where(
            StockMovement.product_id == product_id,
            StockMovement.product.has(
                Product.owner_id == owner_id
            ),
            StockMovement.movement_type == "OUT",
            StockMovement.created_at >= period_start,
        )
    )

    return Decimal(total_consumption or 0) / Decimal(days)


def calculate_risk_level(
    current_stock: Decimal,
    min_stock: Decimal,
    estimated_days: Decimal | None,
) -> str:
    if current_stock <= 0:
        return "OUT_OF_STOCK"

    if current_stock <= min_stock:
        return "CRITICAL"

    if estimated_days is None:
        return "NO_DATA"

    if estimated_days <= 7:
        return "HIGH"

    if estimated_days <= 30:
        return "MEDIUM"

    return "LOW"


def build_stock_intelligence_item(
    db: Session,
    product: Product,
    owner_id: int,
    days: int,
) -> StockIntelligenceItem:
    current_stock = Decimal(product.current_stock)
    min_stock = Decimal(product.min_stock)

    average_daily_consumption = calculate_average_daily_consumption(
        db=db,
        product_id=product.id,
        owner_id=owner_id,
        days=days,
    )

    if average_daily_consumption > 0:
        stock_above_min = current_stock - min_stock

        if stock_above_min <= 0:
            estimated_days_until_min_stock = Decimal(0)
        else:
            estimated_days_until_min_stock = (
                stock_above_min / average_daily_consumption
            )
    else:
        estimated_days_until_min_stock = None

    risk_level = calculate_risk_level(
        current_stock=current_stock,
        min_stock=min_stock,
        estimated_days=estimated_days_until_min_stock,
    )

    return StockIntelligenceItem(
        product_id=product.id,
        product_name=product.name,
        sku=product.sku,
        current_stock=current_stock,
        min_stock=min_stock,
        average_daily_consumption=average_daily_consumption,
        estimated_days_until_min_stock=estimated_days_until_min_stock,
        risk_level=risk_level,
    )


def get_stock_intelligence(
    db: Session,
    owner_id: int,
    days: int = 30,
) -> list[StockIntelligenceItem]:
    products = list(
        db.scalars(
            select(Product)
            .where(
                Product.owner_id == owner_id,
                Product.is_active.is_(True),
            )
            .order_by(Product.name.asc())
        ).all()
    )

    return [
        build_stock_intelligence_item(
            db=db,
            product=product,
            owner_id=owner_id,
            days=days,
        )
        for product in products
    ]


def get_stock_intelligence_product(
    db: Session,
    product_id: int,
    owner_id: int,
    days: int = 30,
) -> StockIntelligenceItem:
    product = db.scalar(
        select(Product).where(
            Product.id == product_id,
            Product.owner_id == owner_id,
        )
    )

    if product is None:
        raise ValueError("Product not found.")

    return build_stock_intelligence_item(
        db=db,
        product=product,
        owner_id=owner_id,
        days=days,
    )


def get_last_movements_by_product(
    db: Session,
    product_ids: list[int],
    owner_id: int,
) -> dict[int, datetime]:
    if not product_ids:
        return {}

    results = db.execute(
        select(
            StockMovement.product_id,
            func.max(StockMovement.created_at),
        )
        .join(
            Product,
            Product.id == StockMovement.product_id,
        )
        .where(
            StockMovement.product_id.in_(product_ids),
            Product.owner_id == owner_id,
        )
        .group_by(StockMovement.product_id)
    ).all()

    return {
        product_id: last_movement_at
        for product_id, last_movement_at in results
    }


def get_stock_intelligence_alerts(
    db: Session,
    owner_id: int,
    days: int = 30,
) -> list[StockAlertItem]:
    intelligence = get_stock_intelligence(
        db=db,
        owner_id=owner_id,
        days=days,
    )

    last_movements = get_last_movements_by_product(
        db=db,
        product_ids=[item.product_id for item in intelligence],
        owner_id=owner_id,
    )

    alerts: list[StockAlertItem] = []

    for item in intelligence:
        if item.risk_level == "OUT_OF_STOCK":
            message = "Produto sem estoque."

        elif item.risk_level == "CRITICAL":
            message = "O estoque do produto está no nível mínimo ou abaixo dele."

        elif item.risk_level == "HIGH":
            message = (
                "O produto deve atingir o estoque mínimo "
                "em até 7 dias."
            )

        elif item.risk_level == "MEDIUM":
            message = (
                "O produto deve atingir o estoque mínimo "
                "em até 30 dias."
            )

        else:
            continue

        alerts.append(
            StockAlertItem(
                product_id=item.product_id,
                product_name=item.product_name,
                sku=item.sku,
                current_stock=item.current_stock,
                min_stock=item.min_stock,
                average_daily_consumption=item.average_daily_consumption,
                estimated_days_until_min_stock=(
                    item.estimated_days_until_min_stock
                ),
                risk_level=item.risk_level,
                message=message,
                last_movement_at=last_movements.get(item.product_id),
            )
        )

    return alerts


