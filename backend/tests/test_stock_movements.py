from decimal import Decimal

from app.models.category import Category
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.models.supplier import Supplier
from app.models.user import User


def get_test_owner(db):
    owner = db.query(User).first()

    if owner is None:
        raise AssertionError(
            "O teste precisa cadastrar um usuário antes de criar "
            "categorias, fornecedores ou produtos."
        )

    return owner


def create_category(db):
    owner = get_test_owner(db)

    category = Category(
        name="Eletrônicos",
        description="Produtos eletrônicos",
        is_active=True,
        owner_id=owner.id,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def create_supplier(db):
    owner = get_test_owner(db)

    supplier = Supplier(
        name="Fornecedor Teste",
        email="fornecedor@example.com",
        phone="62999999999",
        is_active=True,
        owner_id=owner.id,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def create_product(db, stock=0, sku="TEST-001"):
    owner = get_test_owner(db)

    category = db.query(Category).filter(
        Category.name == "Eletrônicos",
        Category.owner_id == owner.id,
    ).first()

    if category is None:
        category = create_category(db)

    supplier = db.query(Supplier).filter(
        Supplier.name == "Fornecedor Teste",
        Supplier.owner_id == owner.id,
    ).first()

    if supplier is None:
        supplier = create_supplier(db)

    product = Product(
        name=f"Produto {sku}",
        sku=sku,
        description="Produto para teste",
        category_id=category.id,
        supplier_id=supplier.id,
        cost_price=Decimal("100"),
        sale_price=Decimal("150"),
        current_stock=stock,
        min_stock=5,
        max_stock=100,
        unit="UN",
        is_active=True,
        owner_id=owner.id,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def register_user(client, email, role="USER"):
    response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Teste",
            "email": email,
            "password": "12345678",
        },
    )

    assert response.status_code == 201, response.text

    if role == "ADMIN":
        raise AssertionError(
            "Cadastre o usuário e promova-o a ADMIN no próprio teste, "
            "antes de criar os dados."
        )

    return response


def login(client, email):
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "12345678",
        },
    )

    assert response.status_code == 200, response.text

    return response.json()["access_token"]


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}",
    }
