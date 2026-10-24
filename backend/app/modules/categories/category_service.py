
import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.modules.categories.category_schema import CategoryCreate, CategoryUpdate


def create_category(
    db: Session, data: CategoryCreate, owner_id: int
) -> Category:
    name = data.name.strip()
    existing = db.scalar(
        select(Category).where(
            Category.owner_id == owner_id,
            func.lower(Category.name) == name.lower(),
        )
    )
    if existing:
        raise ValueError("A category with this name already exists.")

    category = Category(
        owner_id=owner_id,
        name=name,
        description=data.description,
        is_active=True,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_category(
    db: Session, category_id: int, owner_id: int
) -> Category | None:
    return db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.owner_id == owner_id,
        )
    )


def list_categories(
    db: Session,
    page: int,
    page_size: int,
    owner_id: int,
    search: str | None = None,
    is_active: bool | None = None,
) -> tuple[list[Category], int, int]:
    filters = [Category.owner_id == owner_id]
    if search:
        filters.append(Category.name.ilike(f"%{search.strip()}%"))
    if is_active is not None:
        filters.append(Category.is_active == is_active)

    total = db.scalar(
        select(func.count(Category.id)).where(*filters)
    ) or 0
    total_pages = math.ceil(total / page_size) if total else 0

    categories = list(
        db.scalars(
            select(Category)
            .where(*filters)
            .order_by(Category.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    return categories, total, total_pages


def update_category(
    db: Session, category: Category, data: CategoryUpdate
) -> Category:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data:
        name = update_data["name"].strip()
        duplicate = db.scalar(
            select(Category).where(
                Category.owner_id == category.owner_id,
                func.lower(Category.name) == name.lower(),
                Category.id != category.id,
            )
        )
        if duplicate:
            raise ValueError("A category with this name already exists.")
        update_data["name"] = name

    for field, value in update_data.items():
        if field != "owner_id":
            setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    active_count = db.scalar(
        select(func.count(Product.id)).where(
            Product.owner_id == category.owner_id,
            Product.category_id == category.id,
            Product.is_active.is_(True),
        )
    ) or 0

    if active_count:
        raise ValueError(
            "Cannot deactivate a category with active products."
        )

    category.is_active = False
    db.commit()


def restore_category(db: Session, category: Category) -> Category:
    category.is_active = True
    db.commit()
    db.refresh(category)
    return category
