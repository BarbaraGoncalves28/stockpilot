import math

from app.models.category import Category
from app.models.product import Product
from app.modules.categories.category_schema import (
    CategoryCreate,
    CategoryUpdate,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session


def create_category(
    db: Session,
    data: CategoryCreate,
) -> Category:
    name = data.name.strip()

    existing_category = db.scalar(
        select(Category).where(
            func.lower(Category.name) == name.lower()
        )
    )

    if existing_category:
        raise ValueError("A category with this name already exists.")

    category = Category(
        name=name,
        description=data.description,
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def get_category(
    db: Session,
    category_id: int,
) -> Category | None:
    return db.get(Category, category_id)


def list_categories(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    is_active: bool | None = None,
) -> tuple[list[Category], int, int]:
    filters = []

    if search:
        search_term = f"%{search.strip()}%"
        filters.append(Category.name.ilike(search_term))

    if is_active is not None:
        filters.append(Category.is_active == is_active)

    total = (
        db.scalar(
            select(func.count(Category.id)).where(*filters)
        )
        or 0
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    offset = (page - 1) * page_size

    categories = list(
        db.scalars(
            select(Category)
            .where(*filters)
            .order_by(Category.name.asc())
            .offset(offset)
            .limit(page_size)
        ).all()
    )

    return categories, total, total_pages


def update_category(
    db: Session,
    category: Category,
    data: CategoryUpdate,
) -> Category:
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data:
        new_name = update_data["name"].strip()

        existing_category = db.scalar(
            select(Category).where(
                func.lower(Category.name) == new_name.lower(),
                Category.id != category.id,
            )
        )

        if existing_category:
            raise ValueError(
                "A category with this name already exists."
            )

        update_data["name"] = new_name

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


def delete_category(
    db: Session,
    category: Category,
) -> None:
    active_products_count = db.scalar(
        select(func.count(Product.id)).where(
            Product.category_id == category.id,
            Product.is_active.is_(True),
        )
    ) or 0

    if active_products_count > 0:
        raise ValueError(
            "Cannot deactivate a category with active products."
        )

    category.is_active = False

    db.commit()


def restore_category(
    db: Session,
    category: Category,
) -> Category:
    category.is_active = True

    db.commit()
    db.refresh(category)

    return category


