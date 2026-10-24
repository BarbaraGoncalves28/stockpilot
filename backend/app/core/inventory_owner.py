from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.user import User


def resolve_inventory_owner_id(db: Session, current_user) -> int:
    if current_user.role == "ADMIN":
        return current_user.id

    # Os registros existentes foram vinculados ao proprietário original.
    for model in (Product, Category, Supplier):
        owner_id = db.scalar(
            select(model.owner_id)
            .order_by(model.id.asc())
            .limit(1)
        )
        if owner_id is not None:
            return owner_id

    # Permite consultar mesmo quando ainda não existem registros.
    admin_id = db.scalar(
        select(User.id)
        .where(
            User.role == "ADMIN",
            User.is_active.is_(True),
        )
        .order_by(User.id.asc())
        .limit(1)
    )

    return admin_id if admin_id is not None else current_user.id
