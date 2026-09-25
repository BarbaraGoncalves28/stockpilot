from datetime import datetime
from decimal import Decimal

from app.core.exceptions import StockPilotException
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.modules.stock_movements.stock_movement_schema import (
    StockMovementCreate,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def create_stock_movement(
    db: Session,
    data: StockMovementCreate,
    user_id: int,
) -> StockMovement:
    product = db.get(Product, data.product_id)

    if not product:
        raise StockPilotException(
            "Product not found.",
            status_code=400,
        )

    if not product.is_active:
        raise StockPilotException(
            "Product is inactive.",
            status_code=400,
        )

    previous_stock = Decimal(product.current_stock)
    quantity = Decimal(data.quantity)

    if data.movement_type == "IN":
        new_stock = previous_stock + quantity

    elif data.movement_type == "OUT":
        new_stock = previous_stock - quantity

        if new_stock < 0:
            raise StockPilotException(
                "Insufficient stock.",
                status_code=400,
            )

    elif data.movement_type == "ADJUSTMENT":
        new_stock = quantity

    else:
        raise StockPilotException(
            "movement_type must be IN, OUT or ADJUSTMENT.",
            status_code=400,
        )

    movement = StockMovement(
        product_id=product.id,
        user_id=user_id,
        movement_type=data.movement_type,
        quantity=quantity,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reason=data.reason,
        notes=data.notes,
    )

    product.current_stock = new_stock

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


def list_movements(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    product_id: int | None = None,
    movement_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    query = select(StockMovement)

    if product_id is not None:
        product = db.get(Product, product_id)

        if not product:
            raise ValueError("Product not found.")

        query = query.where(
            StockMovement.product_id == product_id
        )

    if movement_type is not None:
        query = query.where(
            StockMovement.movement_type == movement_type
        )

    if start_date is not None:
        query = query.where(
            StockMovement.created_at >= start_date
        )

    if end_date is not None:
        query = query.where(
            StockMovement.created_at < end_date
        )

    total = db.scalar(
        select(func.count())
        .select_from(StockMovement)
        .where(
            *[
                condition
                for condition in [
                    StockMovement.product_id == product_id
                    if product_id is not None
                    else None,
                    StockMovement.movement_type == movement_type
                    if movement_type is not None
                    else None,
                    StockMovement.created_at >= start_date
                    if start_date is not None
                    else None,
                    StockMovement.created_at < end_date
                    if end_date is not None
                    else None,
                ]
                if condition is not None
            ]
        )
    ) or 0

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    movements = list(
        db.scalars(
            query
            .order_by(
                StockMovement.created_at.desc(),
                StockMovement.id.desc(),
            )
            .offset(offset)
            .limit(page_size)
        ).all()
    )

    return movements, total, total_pages


def list_product_movements(
    db: Session,
    product_id: int,
):
    product = db.get(Product, product_id)

    if not product:
        raise ValueError("Product not found.")

    return list(
        db.scalars(
            select(StockMovement)
            .where(
                StockMovement.product_id == product_id
            )
            .order_by(
                StockMovement.created_at.desc(),
                StockMovement.id.desc(),
            )
        ).all()
    )


