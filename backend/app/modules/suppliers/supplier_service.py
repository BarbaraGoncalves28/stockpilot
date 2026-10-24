
import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.supplier import Supplier
from app.modules.suppliers.supplier_schema import SupplierCreate, SupplierUpdate


def validate_supplier_name(
    db: Session,
    name: str,
    owner_id: int,
    supplier_id: int | None = None,
) -> None:
    filters = [
        Supplier.owner_id == owner_id,
        func.lower(Supplier.name) == name.lower(),
    ]
    if supplier_id is not None:
        filters.append(Supplier.id != supplier_id)

    if db.scalar(select(Supplier).where(*filters)):
        raise ValueError("A supplier with this name already exists.")


def create_supplier(
    db: Session, data: SupplierCreate, owner_id: int
) -> Supplier:
    name = data.name.strip()
    validate_supplier_name(db, name, owner_id)

    supplier = Supplier(
        owner_id=owner_id,
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
    db: Session, supplier_id: int, owner_id: int
) -> Supplier | None:
    return db.scalar(
        select(Supplier).where(
            Supplier.id == supplier_id,
            Supplier.owner_id == owner_id,
        )
    )


def list_suppliers(
    db: Session,
    page: int,
    page_size: int,
    owner_id: int,
    search: str | None = None,
    is_active: bool | None = None,
) -> tuple[list[Supplier], int, int]:
    filters = [Supplier.owner_id == owner_id]
    if search:
        filters.append(Supplier.name.ilike(f"%{search.strip()}%"))
    if is_active is not None:
        filters.append(Supplier.is_active == is_active)

    total = db.scalar(
        select(func.count(Supplier.id)).where(*filters)
    ) or 0
    total_pages = math.ceil(total / page_size) if total else 0

    suppliers = list(
        db.scalars(
            select(Supplier)
            .where(*filters)
            .order_by(Supplier.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    return suppliers, total, total_pages


def update_supplier(
    db: Session, supplier: Supplier, data: SupplierUpdate
) -> Supplier:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data:
        name = update_data["name"].strip()
        validate_supplier_name(
            db, name, supplier.owner_id, supplier.id
        )
        update_data["name"] = name

    for field, value in update_data.items():
        if field != "owner_id":
            setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier: Supplier) -> None:
    active_count = db.scalar(
        select(func.count(Product.id)).where(
            Product.owner_id == supplier.owner_id,
            Product.supplier_id == supplier.id,
            Product.is_active.is_(True),
        )
    ) or 0

    if active_count:
        raise ValueError(
            "Cannot deactivate a supplier with active products."
        )

    supplier.is_active = False
    db.commit()


def restore_supplier(db: Session, supplier: Supplier) -> Supplier:
    supplier.is_active = True
    db.commit()
    db.refresh(supplier)
    return supplier
