import math

from sqlalchemy import func, or_, select, text
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier
from app.modules.products.product_schema import ProductCreate, ProductUpdate


def validate_product_relations(
    db: Session,
    owner_id: int,
    category_id: int,
    supplier_id: int | None,
) -> None:
    category = db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.owner_id == owner_id,
        )
    )
    if not category:
        raise ValueError("Category not found.")
    if not category.is_active:
        raise ValueError("Category is inactive.")

    if supplier_id is not None:
        supplier = db.scalar(
            select(Supplier).where(
                Supplier.id == supplier_id,
                Supplier.owner_id == owner_id,
            )
        )
        if not supplier:
            raise ValueError("Supplier not found.")
        if not supplier.is_active:
            raise ValueError("Supplier is inactive.")


def generate_product_sku(db: Session) -> str:
    # A sequência será criada por migração antes de esta função ser utilizada.
    value = db.execute(
        text("SELECT nextval('product_sku_seq')")
    ).scalar_one()
    return f"STK-{value:06d}"


def create_product(
    db: Session, data: ProductCreate, owner_id: int
) -> Product:
    sku = data.sku or generate_product_sku(db)
    existing_product = db.scalar(
        select(Product).where(
            Product.owner_id == owner_id,
            Product.sku == sku,
        )
    )
    if existing_product:
        raise ValueError("A product with this SKU already exists.")

    validate_product_relations(
        db, owner_id, data.category_id, data.supplier_id
    )

    product = Product(
        owner_id=owner_id,
        name=data.name.strip(),
        sku=sku,
        description=data.description,
        category_id=data.category_id,
        supplier_id=data.supplier_id,
        cost_price=data.cost_price,
        sale_price=data.sale_price,
        current_stock=data.current_stock,
        min_stock=data.min_stock,
        max_stock=data.max_stock,
        unit=data.unit,
        is_active=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product(db: Session, product_id: int, owner_id: int) -> Product | None:
    return db.scalar(
        select(Product).where(
            Product.id == product_id,
            Product.owner_id == owner_id,
        )
    )


def list_products(
    db: Session,
    page: int,
    page_size: int,
    owner_id: int,
    search: str | None = None,
    category_id: int | None = None,
    supplier_id: int | None = None,
    is_active: bool | None = None,
) -> tuple[list[Product], int, int]:
    filters = [Product.owner_id == owner_id]
    if search:
        term = f"%{search.strip()}%"
        filters.append(or_(Product.name.ilike(term), Product.sku.ilike(term)))
    if category_id is not None:
        filters.append(Product.category_id == category_id)
    if supplier_id is not None:
        filters.append(Product.supplier_id == supplier_id)
    if is_active is not None:
        filters.append(Product.is_active == is_active)

    total = db.scalar(select(func.count(Product.id)).where(*filters)) or 0
    total_pages = math.ceil(total / page_size) if total else 0
    products = list(
        db.scalars(
            select(Product)
            .where(*filters)
            .order_by(Product.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    return products, total, total_pages


def update_product(
    db: Session, product: Product, data: ProductUpdate, owner_id: int
) -> Product:
    update_data = data.model_dump(exclude_unset=True)

    if "owner_id" in update_data:
        raise ValueError("The product owner cannot be changed.")

    effective_supplier_id = update_data.get("supplier_id", product.supplier_id)

    if "category_id" in update_data or "supplier_id" in update_data:
        validate_product_relations(
            db,
            owner_id,
            update_data.get("category_id", product.category_id),
            effective_supplier_id,
        )

    if "min_stock" in update_data or "max_stock" in update_data:
        minimum = update_data.get("min_stock", product.min_stock)
        maximum = update_data.get("max_stock", product.max_stock)
        if maximum is not None and maximum < minimum:
            raise ValueError("max_stock must be greater than or equal to min_stock.")

    if "sku" in update_data:
        duplicate = db.scalar(
            select(Product).where(
                Product.owner_id == owner_id,
                Product.sku == update_data["sku"],
                Product.id != product.id,
            )
        )
        if duplicate:
            raise ValueError("A product with this SKU already exists.")

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    product.is_active = False
    db.commit()


def restore_product(db: Session, product: Product) -> Product:
    product.is_active = True
    db.commit()
    db.refresh(product)
    return product
