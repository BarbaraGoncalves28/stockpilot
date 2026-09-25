import math

from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier
from app.modules.products.product_schema import ProductCreate, ProductUpdate
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session


def validate_product_relations(
    db: Session,
    category_id: int,
    supplier_id: int | None,
) -> None:
    category = db.get(Category, category_id)

    if not category:
        raise ValueError("Category not found.")

    if not category.is_active:
        raise ValueError("Category is inactive.")

    if supplier_id is not None:
        supplier = db.get(Supplier, supplier_id)

        if not supplier:
            raise ValueError("Supplier not found.")

        if not supplier.is_active:
            raise ValueError("Supplier is inactive.")


def create_product(db: Session, data: ProductCreate) -> Product:
    existing_product = db.scalar(
        select(Product).where(Product.sku == data.sku)
    )

    if existing_product:
        raise ValueError("A product with this SKU already exists.")

    validate_product_relations(
        db=db,
        category_id=data.category_id,
        supplier_id=data.supplier_id,
    )

    product = Product(
        name=data.name.strip(),
        sku=data.sku,
        description=data.description,
        category_id=data.category_id,
        supplier_id=data.supplier_id,
        cost_price=data.cost_price,
        sale_price=data.sale_price,
        min_stock=data.min_stock,
        max_stock=data.max_stock,
        unit=data.unit,
        current_stock=0,
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_product(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def list_products(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    category_id: int | None = None,
    supplier_id: int | None = None,
    is_active: bool | None = None,
) -> tuple[list[Product], int, int]:
    filters = []

    if search:
        search_term = f"%{search.strip()}%"

        filters.append(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
            )
        )

    if category_id is not None:
        filters.append(Product.category_id == category_id)

    if supplier_id is not None:
        filters.append(Product.supplier_id == supplier_id)

    if is_active is not None:
        filters.append(Product.is_active == is_active)

    total = (
        db.scalar(
            select(func.count(Product.id)).where(*filters)
        )
        or 0
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    offset = (page - 1) * page_size

    products = list(
        db.scalars(
            select(Product)
            .where(*filters)
            .order_by(Product.name.asc())
            .offset(offset)
            .limit(page_size)
        ).all()
    )

    return products, total, total_pages


def update_product(
    db: Session,
    product: Product,
    data: ProductUpdate,
) -> Product:
    update_data = data.model_dump(exclude_unset=True)

    if "category_id" in update_data or "supplier_id" in update_data:
        category_id = update_data.get(
            "category_id",
            product.category_id,
        )

        supplier_id = update_data.get(
            "supplier_id",
            product.supplier_id,
        )

        validate_product_relations(
            db=db,
            category_id=category_id,
            supplier_id=supplier_id,
        )

    if "min_stock" in update_data or "max_stock" in update_data:
        min_stock = update_data.get(
            "min_stock",
            product.min_stock,
        )

        max_stock = update_data.get(
            "max_stock",
            product.max_stock,
        )

        if (
            max_stock is not None
            and max_stock < min_stock
        ):
            raise ValueError(
                "max_stock must be greater than or equal to min_stock."
            )

    if "sku" in update_data:
        existing_product = db.scalar(
            select(Product).where(
                Product.sku == update_data["sku"],
                Product.id != product.id,
            )
        )

        if existing_product:
            raise ValueError(
                "A product with this SKU already exists."
            )

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product: Product,
) -> None:
    product.is_active = False

    db.commit()


def restore_product(
    db: Session,
    product: Product,
) -> Product:
    product.is_active = True

    db.commit()
    db.refresh(product)

    return product


