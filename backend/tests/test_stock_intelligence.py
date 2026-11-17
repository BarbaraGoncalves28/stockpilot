from datetime import UTC, datetime, timedelta

from app.models.category import Category
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.models.user import User


def create_category(db):
    owner = db.query(User).filter(
        User.email == "intelligence@example.com"
    ).first()

    if owner is None:
        raise AssertionError(
            "Cadastre o usuário antes de criar a categoria."
        )

    category = Category(
        name="Categoria Intelligence",
        description="Categoria para testes de inteligência de estoque",
        is_active=True,
        owner_id=owner.id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def create_product(
    db,
    *,
    category_id: int,
    name: str,
    sku: str,
    current_stock: int,
    min_stock: int,
):
    owner = db.query(User).filter(
        User.email == "intelligence@example.com"
    ).first()

    if owner is None:
        raise AssertionError(
            "Cadastre o usuário antes de criar o produto."
        )

    product = Product(
        name=name,
        sku=sku,
        description="Produto para teste de Stock Intelligence",
        category_id=category_id,
        supplier_id=None,
        cost_price=100,
        sale_price=150,
        current_stock=current_stock,
        min_stock=min_stock,
        max_stock=100,
        unit="UN",
        is_active=True,
        owner_id=owner.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def create_movement(
    db,
    *,
    product_id: int,
    user_id: int,
    movement_type: str,
    quantity: int,
    created_at: datetime,
):
    movement = StockMovement(
        product_id=product_id,
        user_id=user_id,
        movement_type=movement_type,
        quantity=quantity,
        previous_stock=0,
        new_stock=0,
        reason="Teste",
        notes=None,
        created_at=created_at,
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


def register_and_login(client):
    client.post(
        "/auth/register",
        json={
            "name": "Usuário Intelligence",
            "email": "intelligence@example.com",
            "password": "12345678",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "intelligence@example.com",
            "password": "12345678",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def test_stock_intelligence_requires_authentication(client):
    response = client.get("/stock-intelligence")

    assert response.status_code == 401


def test_stock_intelligence_alerts_require_authentication(client):
    response = client.get("/stock-intelligence/alerts")

    assert response.status_code == 401


def test_stock_intelligence_calculates_average_daily_consumption(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    product = create_product(
        db,
        category_id=category.id,
        name="Teclado",
        sku="INT-001",
        current_stock=40,
        min_stock=10,
    )

    now = datetime.now(UTC).replace(tzinfo=None)

    create_movement(
    db,
    product_id=product.id,
    user_id=1,
    movement_type="OUT",
    quantity=30,
    created_at=now - timedelta(days=10),
)

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["product_id"] == product.id
    assert float(data[0]["average_daily_consumption"]) == 1.0


def test_stock_intelligence_ignores_old_movements(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    product = create_product(
        db,
        category_id=category.id,
        name="Mouse",
        sku="INT-002",
        current_stock=40,
        min_stock=10,
    )

    now = datetime.now(UTC).replace(tzinfo=None)

    create_movement(
        db,
        product_id=product.id,
        user_id=1,
        movement_type="OUT",
        quantity=60,
        created_at=now - timedelta(days=31),
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=1,
        movement_type="OUT",
        quantity=30,
        created_at=now - timedelta(days=10),
    )

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert float(data[0]["average_daily_consumption"]) == 1.0


def test_stock_intelligence_ignores_entries(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    product = create_product(
        db,
        category_id=category.id,
        name="Monitor",
        sku="INT-003",
        current_stock=40,
        min_stock=10,
    )

    now = datetime.now(UTC).replace(tzinfo=None)

    create_movement(
        db,
        product_id=product.id,
        user_id=1,
        movement_type="IN",
        quantity=100,
        created_at=now - timedelta(days=10),
    )

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert float(data[0]["average_daily_consumption"]) == 0.0
    assert data[0]["estimated_days_until_min_stock"] is None
    assert data[0]["risk_level"] == "NO_DATA"


def test_stock_intelligence_calculates_days_until_min_stock(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    product = create_product(
        db,
        category_id=category.id,
        name="Headset",
        sku="INT-004",
        current_stock=40,
        min_stock=10,
    )

    now = datetime.now(UTC).replace(tzinfo=None)

    create_movement(
        db,
        product_id=product.id,
        user_id=1,
        movement_type="OUT",
        quantity=60,
        created_at=now - timedelta(days=10),
    )

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1

    assert float(
        data[0]["average_daily_consumption"]
    ) == 2.0

    assert float(
        data[0]["estimated_days_until_min_stock"]
    ) == 15.0


def test_stock_intelligence_identifies_risk_levels(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    products = [
        create_product(
            db,
            category_id=category.id,
            name="Produto Crítico",
            sku="INT-005",
            current_stock=5,
            min_stock=10,
        ),
        create_product(
            db,
            category_id=category.id,
            name="Produto Alto Risco",
            sku="INT-006",
            current_stock=20,
            min_stock=10,
        ),
        create_product(
            db,
            category_id=category.id,
            name="Produto Médio Risco",
            sku="INT-007",
            current_stock=50,
            min_stock=10,
        ),
        create_product(
            db,
            category_id=category.id,
            name="Produto Sem Dados",
            sku="INT-008",
            current_stock=50,
            min_stock=10,
        ),
        create_product(
            db,
            category_id=category.id,
            name="Produto Sem Estoque",
            sku="INT-009",
            current_stock=0,
            min_stock=10,
        ),
    ]

    now = datetime.now(UTC).replace(tzinfo=None)

    create_movement(
        db,
        product_id=products[1].id,
        user_id=1,
        movement_type="OUT",
        quantity=60,
        created_at=now - timedelta(days=10),
    )

    create_movement(
        db,
        product_id=products[2].id,
        user_id=1,
        movement_type="OUT",
        quantity=10,
        created_at=now - timedelta(days=10),
    )

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200

    data = {
        item["sku"]: item
        for item in response.json()
    }

    assert data["INT-005"]["risk_level"] == "CRITICAL"
    assert data["INT-006"]["risk_level"] == "HIGH"
    assert data["INT-007"]["risk_level"] == "LOW"
    assert data["INT-008"]["risk_level"] == "NO_DATA"
    assert data["INT-009"]["risk_level"] == "OUT_OF_STOCK"

def test_stock_intelligence_only_returns_active_products(
    client,
    db,
):
    headers = register_and_login(client)

    owner = db.query(User).filter(
        User.email == "intelligence@example.com"
    ).first()

    assert owner is not None

    category = create_category(db)

    active_product = create_product(
        db,
        category_id=category.id,
        name="Produto Ativo",
        sku="INT-010",
        current_stock=20,
        min_stock=5,
    )

    inactive_product = Product(
        name="Produto Inativo",
        sku="INT-011",
        description="Produto inativo",
        category_id=category.id,
        supplier_id=None,
        cost_price=100,
        sale_price=150,
        current_stock=20,
        min_stock=5,
        max_stock=100,
        unit="UN",
        is_active=False,
        owner_id=owner.id,
    )

    db.add(inactive_product)
    db.commit()
    db.refresh(inactive_product)

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200, response.text

    data = response.json()

    product_ids = [
        item["product_id"]
        for item in data
    ]

    assert active_product.id in product_ids
    assert inactive_product.id not in product_ids


def test_stock_intelligence_alerts_only_returns_products_with_alerts(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    critical_product = create_product(
        db,
        category_id=category.id,
        name="Produto Crítico",
        sku="INT-012",
        current_stock=5,
        min_stock=10,
    )

    normal_product = create_product(
        db,
        category_id=category.id,
        name="Produto Normal",
        sku="INT-013",
        current_stock=100,
        min_stock=10,
    )

    response = client.get(
        "/stock-intelligence/alerts",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    product_ids = {
        item["product_id"]
        for item in data
    }

    assert critical_product.id in product_ids
    assert normal_product.id not in product_ids

    critical_alert = next(
        item
        for item in data
        if item["product_id"] == critical_product.id
    )

    assert critical_alert["risk_level"] == "CRITICAL"
    assert critical_alert["message"] == (
        "O estoque do produto está no nível mínimo ou abaixo dele."
    )


def test_stock_intelligence_orders_products_by_name(
    client,
    db,
):
    headers = register_and_login(client)

    category = create_category(db)

    create_product(
        db,
        category_id=category.id,
        name="Zebra",
        sku="INT-014",
        current_stock=20,
        min_stock=5,
    )

    create_product(
        db,
        category_id=category.id,
        name="Alpha",
        sku="INT-015",
        current_stock=20,
        min_stock=5,
    )

    response = client.get(
        "/stock-intelligence",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert [item["product_name"] for item in data] == [
        "Alpha",
        "Zebra",
    ]

def test_stock_intelligence_accepts_custom_days(client, db):
    headers = register_and_login(client)

    user = db.query(User).filter(
        User.email == "intelligence@example.com"
    ).first()

    assert user is not None

    category = create_category(db)

    product = create_product(
        db,
        category_id=category.id,
        name="Produto Período",
        sku="PER-001",
        current_stock=100,
        min_stock=10,
    )

    create_movement(
        db,
        product_id=product.id,
        movement_type="OUT",
        quantity=60,
        user_id=user.id,
        created_at=(
            datetime.now(UTC).replace(tzinfo=None)
            - timedelta(days=5)
        ),
    )

    response = client.get(
        "/stock-intelligence?days=10",
        headers=headers,
    )

    assert response.status_code == 200, response.text

    item = next(
        item
        for item in response.json()
        if item["product_id"] == product.id
    )

    from decimal import Decimal

    assert Decimal(item["average_daily_consumption"]) == Decimal(6)


def test_stock_intelligence_rejects_invalid_days(client):
    headers = register_and_login(client)

    response = client.get(
        "/stock-intelligence?days=0",
        headers=headers,
    )

    assert response.status_code == 422

    response = client.get(
        "/stock-intelligence?days=366",
        headers=headers,
    )

    assert response.status_code == 422


def test_stock_intelligence_product_requires_authentication(client):
    response = client.get("/stock-intelligence/product/1")

    assert response.status_code == 401

def test_stock_intelligence_returns_product_by_id(client, db):
    headers = register_and_login(client)

    category = create_category(db)

    product = create_product(
        db,
        category_id=category.id,
        name="Produto Individual",
        sku="IND-001",
        current_stock=50,
        min_stock=10,
    )

    response = client.get(
        f"/stock-intelligence/product/{product.id}",
        headers=headers,
    )

    assert response.status_code == 200, response.text

    data = response.json()

    assert data["product_id"] == product.id
    assert data["product_name"] == "Produto Individual"
    assert data["sku"] == "IND-001"
    assert data["current_stock"] == "50.000"
    assert data["min_stock"] == "10.000"


def test_stock_intelligence_returns_404_for_nonexistent_product(client):
    headers = register_and_login(client)

    response = client.get(
        "/stock-intelligence/product/999",
        headers=headers,
    )

    assert response.status_code == 404

def test_stock_intelligence_alerts_returns_last_movement_at(
    client,
    db,
):
    headers = register_and_login(client)
    category = create_category(db)

    owner = db.query(User).filter(
        User.email == "intelligence@example.com"
    ).first()

    product_with_movements = create_product(
        db,
        category_id=category.id,
        name="Produto com Movimentações",
        sku="INT-014",
        current_stock=5,
        min_stock=10,
    )

    product_without_movements = create_product(
        db,
        category_id=category.id,
        name="Produto sem Movimentações",
        sku="INT-015",
        current_stock=0,
        min_stock=10,
    )

    first_movement_at = datetime(2026, 10, 20, 10, 30)
    last_movement_at = datetime(2026, 10, 22, 15, 45)

    create_movement(
        db,
        product_id=product_with_movements.id,
        user_id=owner.id,
        movement_type="IN",
        quantity=10,
        created_at=first_movement_at,
    )

    create_movement(
        db,
        product_id=product_with_movements.id,
        user_id=owner.id,
        movement_type="OUT",
        quantity=5,
        created_at=last_movement_at,
    )

    response = client.get(
        "/stock-intelligence/alerts",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    alert_with_movements = next(
        item
        for item in data
        if item["product_id"] == product_with_movements.id
    )

    alert_without_movements = next(
        item
        for item in data
        if item["product_id"] == product_without_movements.id
    )

    assert alert_with_movements["last_movement_at"] == (
        last_movement_at.isoformat()
    )

    assert alert_without_movements["last_movement_at"] is None


