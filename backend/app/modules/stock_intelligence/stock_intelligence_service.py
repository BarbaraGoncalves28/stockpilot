from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.modules.stock_intelligence.stock_intelligence_schema import (
    StockAlertItem,
    StockIntelligenceItem,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def calculate_average_daily_consumption(
    db: Session,
    product_id: int,
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
            StockMovement.movement_type == "OUT",
            StockMovement.created_at >= period_start,
        )
    )

    if total_consumption is None:
        return Decimal(0)

    return Decimal(total_consumption) / Decimal(days)


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
    days: int,
) -> StockIntelligenceItem:
    current_stock = Decimal(product.current_stock)
    min_stock = Decimal(product.min_stock)

    average_daily_consumption = calculate_average_daily_consumption(
        db,
        product.id,
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
        current_stock,
        min_stock,
        estimated_days_until_min_stock,
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
    days: int = 30,
) -> list[StockIntelligenceItem]:
    products = list(
        db.scalars(
            select(Product)
            .where(Product.is_active.is_(True))
            .order_by(Product.name.asc())
        ).all()
    )

    return [
        build_stock_intelligence_item(
            db,
            product,
            days=days,
        )
        for product in products
    ]


def get_stock_intelligence_product(
    db: Session,
    product_id: int,
    days: int = 30,
) -> StockIntelligenceItem:
    product = db.get(Product, product_id)

    if not product or not product.is_active:
        raise ValueError("Product not found.")

    return build_stock_intelligence_item(
        db,
        product,
        days=days,
    )


def get_stock_intelligence_alerts(
    db: Session,
    days: int = 30,
) -> list[StockAlertItem]:
    intelligence = get_stock_intelligence(
        db,
        days=days,
    )

    alerts: list[StockAlertItem] = []

    for item in intelligence:
        if item.risk_level == "OUT_OF_STOCK":
            message = "Product is out of stock."

        elif item.risk_level == "CRITICAL":
            message = "Product stock is at or below the minimum level."

        elif item.risk_level == "HIGH":
            message = (
                "Product is expected to reach the minimum stock level "
                "within 7 days."
            )

        elif item.risk_level == "MEDIUM":
            message = (
                "Product is expected to reach the minimum stock level "
                "within 30 days."
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
            )
        )

    return alerts