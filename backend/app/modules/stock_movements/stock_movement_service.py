
from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import StockPilotException
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.modules.stock_movements.stock_movement_schema import (
    StockMovementCreate,
)


def create_stock_movement(
    db: Session,
    data: StockMovementCreate,
    user_id: int,
    owner_id: int,
) -> StockMovement:
    # A conta só pode movimentar produtos que pertencem a ela.
    product = db.scalar(
        select(Product)
          .where(
            Product.id == data.product_id,
            Product.owner_id == owner_id,
        )
        .with_for_update()
    )

    if product is None:
        raise StockPilotException(
            "Product not found.",
            status_code=404,
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
    owner_id: int,
    page: int = 1,
    page_size: int = 20,
    product_id: int | None = None,
    movement_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    # Sempre limita as movimentações aos produtos desta conta.
    filters = [
        StockMovement.product.has(Product.owner_id == owner_id),
    ]

    if product_id is not None:
        owned_product = db.scalar(
            select(Product.id).where(
                Product.id == product_id,
                Product.owner_id == owner_id,
            )
        )

        if owned_product is None:
            raise ValueError("Product not found.")

        filters.append(StockMovement.product_id == product_id)

    if movement_type is not None:
        filters.append(StockMovement.movement_type == movement_type)

    if start_date is not None:
        filters.append(StockMovement.created_at >= start_date)

    if end_date is not None:
        filters.append(StockMovement.created_at < end_date)

    total = db.scalar(
        select(func.count(StockMovement.id)).where(*filters)
    ) or 0

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    query = (
        select(StockMovement)
        .options(joinedload(StockMovement.product))
        .where(*filters)
        .order_by(
            StockMovement.created_at.desc(),
            StockMovement.id.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    movements = list(db.scalars(query).all())

    return movements, total, total_pages


def list_product_movements(
    db: Session,
    product_id: int,
    owner_id: int,
) -> list[StockMovement]:
    product = db.scalar(
        select(Product.id).where(
            Product.id == product_id,
            Product.owner_id == owner_id,
        )
    )

    if product is None:
        raise ValueError("Product not found.")

    return list(
        db.scalars(
            select(StockMovement)
            .options(joinedload(StockMovement.product))
            .where(StockMovement.product_id == product_id)
            .order_by(
                StockMovement.created_at.desc(),
                StockMovement.id.desc(),
            )
        ).all()
    )
