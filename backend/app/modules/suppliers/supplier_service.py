import math

from app.models.product import Product
from app.models.supplier import Supplier
from app.modules.suppliers.supplier_schema import (
    SupplierCreate,
    SupplierUpdate,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def validate_supplier_name(
    db: Session,
    name: str,
    supplier_id: int | None = None,
) -> None:
    existing_supplier = db.scalar(
        select(Supplier).where(
            func.lower(Supplier.name) == name.lower(),
            Supplier.id != supplier_id if supplier_id is not None else True,
        )
    )

    if existing_supplier:
        raise ValueError("A supplier with this name already exists.")


def create_supplier(
    db: Session,
    data: SupplierCreate,
) -> Supplier:
    name = data.name.strip()

    validate_supplier_name(
        db=db,
        name=name,
    )

    supplier = Supplier(
        name=name,
        email=data.email,
        phone=data.phone,
        document=data.document,
        address=data.address,
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def get_supplier(
    db: Session,
    supplier_id: int,
) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def list_suppliers(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    is_active: bool | None = None,
) -> tuple[list[Supplier], int, int]:
    filters = []

    if search:
        search_term = f"%{search.strip()}%"
        filters.append(Supplier.name.ilike(search_term))

    if is_active is not None:
        filters.append(Supplier.is_active == is_active)

    total = (
        db.scalar(
            select(func.count(Supplier.id)).where(*filters)
        )
        or 0
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    offset = (page - 1) * page_size

    suppliers = list(
        db.scalars(
            select(Supplier)
            .where(*filters)
            .order_by(Supplier.name.asc())
            .offset(offset)
            .limit(page_size)
        ).all()
    )

    return suppliers, total, total_pages


def update_supplier(
    db: Session,
    supplier: Supplier,
    data: SupplierUpdate,
) -> Supplier:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data:
        new_name = update_data["name"].strip()

        validate_supplier_name(
            db=db,
            name=new_name,
            supplier_id=supplier.id,
        )

        update_data["name"] = new_name

    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)

    return supplier


def delete_supplier(
    db: Session,
    supplier: Supplier,
) -> None:
    active_products_count = db.scalar(
        select(func.count(Product.id)).where(
            Product.supplier_id == supplier.id,
            Product.is_active.is_(True),
        )
    ) or 0

    if active_products_count > 0:
        raise ValueError(
            "Cannot deactivate a supplier with active products."
        )

    supplier.is_active = False

    db.commit()


def restore_supplier(
    db: Session,
    supplier: Supplier,
) -> Supplier:
    supplier.is_active = True

    db.commit()
    db.refresh(supplier)

    return supplier


