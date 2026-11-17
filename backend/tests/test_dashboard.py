from datetime import UTC, datetime, timedelta

from app.models.category import Category
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.models.user import User


def register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Dashboard",
            "email": "dashboard@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 201
    return response.json()


def get_auth_headers(client):
    response = client.post(
        "/auth/login",
        json={
            "email": "dashboard@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def create_product(
    db,
    *,
    name: str,
    sku: str,
    current_stock: int,
    min_stock: int,
    is_active: bool = True,
):
    owner = db.query(User).filter(
        User.email == "dashboard@example.com"
    ).first()

    if owner is None:
        raise AssertionError(
            "Cadastre o usuário do dashboard antes de criar produtos."
        )

    category = db.query(Category).filter(
        Category.name == "Categoria Dashboard",
        Category.owner_id == owner.id,
    ).first()

    if category is None:
        category = Category(
            name="Categoria Dashboard",
            description="Categoria para testes do dashboard",
            is_active=True,
            owner_id=owner.id,
        )
        db.add(category)
        db.commit()
        db.refresh(category)

    product = Product(
        owner_id=owner.id,
        name=name,
        sku=sku,
        description="Produto para teste do dashboard",
        category_id=category.id,
        supplier_id=None,
        cost_price=100,
        sale_price=150,
        current_stock=current_stock,
        min_stock=min_stock,
        max_stock=100,
        unit="UN",
        is_active=is_active,
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
    previous_stock: int = 0,
    new_stock: int | None = None,
    created_at: datetime | None = None,
):
    movement = StockMovement(
        product_id=product_id,
        user_id=user_id,
        movement_type=movement_type,
        quantity=quantity,
        previous_stock=previous_stock,
        new_stock=(
            new_stock if new_stock is not None else quantity
        ),
        reason="Teste dashboard",
        notes=None,
        created_at=created_at or datetime.now(UTC).replace(tzinfo=None),
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


def test_dashboard_summary_requires_authentication(client):
    response = client.get("/dashboard/summary")

    assert response.status_code == 401


def test_dashboard_movements_requires_authentication(client):
    response = client.get("/dashboard/movements")

    assert response.status_code == 401


def test_dashboard_summary_returns_stock_statistics(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    create_product(
        db,







        name="Produto Normal",
        sku="DASH-001",
        current_stock=20,
        min_stock=5,
    )

    create_product(
        db,
        name="Produto Baixo",
        sku="DASH-002",
        current_stock=3,
        min_stock=5,
    )

    create_product(
        db,
        name="Produto Zerado",
        sku="DASH-003",
        current_stock=0,
        min_stock=5,
    )

    create_product(
        db,
        name="Produto Inativo",
        sku="DASH-004",
        current_stock=0,
        min_stock=5,
        is_active=False,
    )

    response = client.get(
        "/dashboard/summary",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_products"] == 3
    assert data["low_stock_products"] == 1
    assert data["out_of_stock_products"] == 1


def test_dashboard_summary_returns_movement_totals(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    user = db.query(User).filter(
        User.email == "dashboard@example.com"
    ).first()

    product = create_product(
        db,
        name="Produto Movimentado",
        sku="DASH-005",
        current_stock=10,
        min_stock=5,
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=10,
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=5,
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="OUT",
        quantity=4,
    )

    response = client.get(
        "/dashboard/summary",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_movements"] == 3
    assert float(data["total_entries"]) == 15
    assert float(data["total_exits"]) == 4


def test_dashboard_summary_returns_period_statistics(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    user = db.query(User).filter(
        User.email == "dashboard@example.com"
    ).first()

    product = create_product(
        db,
        name="Produto Período",
        sku="DASH-006",
        current_stock=10,
        min_stock=5,
    )

    now = datetime.now(UTC).replace(tzinfo=None)

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=10,
        created_at=now - timedelta(days=5),
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="OUT",
        quantity=3,
        created_at=now - timedelta(days=3),
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=20,
        created_at=now - timedelta(days=60),
    )

    response = client.get(
        "/dashboard/summary?days=30",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["period_days"] == 30
    assert data["period_movements"] == 2
    assert float(data["period_entries"]) == 10
    assert float(data["period_exits"]) == 3


def test_dashboard_summary_days_defaults_to_30(
    client,
):
    register_user(client)
    headers = get_auth_headers(client)

    response = client.get(
        "/dashboard/summary",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["period_days"] == 30


def test_dashboard_summary_rejects_invalid_days(
    client,
):
    register_user(client)
    headers = get_auth_headers(client)

    response = client.get(
        "/dashboard/summary?days=0",
        headers=headers,
    )

    assert response.status_code == 422

    response = client.get(
        "/dashboard/summary?days=366",
        headers=headers,
    )

    assert response.status_code == 422


def test_dashboard_movements_groups_entries_and_exits_by_date(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    user = db.query(User).filter(
        User.email == "dashboard@example.com"
    ).first()

    product = create_product(
        db,
        name="Produto Gráfico",
        sku="DASH-007",
        current_stock=10,
        min_stock=5,
    )

    today = datetime.now(UTC).replace(tzinfo=None).replace(
        hour=10,
        minute=0,
        second=0,
        microsecond=0,
    )

    yesterday = today - timedelta(days=1)

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=10,
        created_at=yesterday,
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="OUT",
        quantity=3,
        created_at=yesterday,
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=5,
        created_at=today,
    )

    response = client.get(
        "/dashboard/movements?days=30",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert data[0]["date"] == yesterday.strftime("%Y-%m-%d")
    assert float(data[0]["entries"]) == 10
    assert float(data[0]["exits"]) == 3

    assert data[1]["date"] == today.strftime("%Y-%m-%d")
    assert float(data[1]["entries"]) == 5
    assert float(data[1]["exits"]) == 0


def test_dashboard_movements_ignores_adjustments(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    user = db.query(User).filter(
        User.email == "dashboard@example.com"
    ).first()

    product = create_product(
        db,
        name="Produto Ajuste",
        sku="DASH-008",
        current_stock=10,
        min_stock=5,
    )

    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="ADJUSTMENT",
        quantity=50,
    )

    response = client.get(
        "/dashboard/movements",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json() == []

def test_dashboard_movements_rejects_invalid_days(
    client,
):
    register_user(client)
    headers = get_auth_headers(client)

    response = client.get(
        "/dashboard/movements?days=0",
        headers=headers,
    )

    assert response.status_code == 422

    response = client.get(
        "/dashboard/movements?days=366",
        headers=headers,
    )

    assert response.status_code == 422


def test_dashboard_summary_and_movements_accept_maximum_days(
    client,
):
    register_user(client)
    headers = get_auth_headers(client)

    summary_response = client.get(
        "/dashboard/summary?days=365",
        headers=headers,
    )

    assert summary_response.status_code == 200
    assert summary_response.json()["period_days"] == 365

    movements_response = client.get(
        "/dashboard/movements?days=365",
        headers=headers,
    )

    assert movements_response.status_code == 200
    assert movements_response.json() == []

def test_dashboard_summary_calculates_stock_turnover_rate(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    user = db.query(User).filter(
        User.email == "dashboard@example.com"
    ).first()

    product = create_product(
        db,
        name="Produto Giro",
        sku="DASH-009",
        current_stock=8,
        min_stock=2,
    )

    now = datetime.now(UTC).replace(tzinfo=None)

    # Estoque inicial: 10 unidades.
    # Entrada: 5 unidades.
    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="IN",
        quantity=5,
        previous_stock=10,
        new_stock=15,
        created_at=now - timedelta(days=2),
    )

    # Saída: 3 unidades.
    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="OUT",
        quantity=3,
        previous_stock=15,
        new_stock=12,
        created_at=now - timedelta(days=1),
    )

    # Ajuste: estoque passa de 12 para 8.
    # Não deve ser contabilizado como saída.
    create_movement(
        db,
        product_id=product.id,
        user_id=user.id,
        movement_type="ADJUSTMENT",
        quantity=8,
        previous_stock=12,
        new_stock=8,
        created_at=now,
    )

    response = client.get(
        "/dashboard/summary?days=30",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    # Estoque inicial: 10 x R$ 100 = R$ 1.000.
    # Estoque atual: 8 x R$ 100 = R$ 800.
    # Estoque médio: R$ 900.
    # Custo das saídas: 3 x R$ 100 = R$ 300.
    # Giro: (300 / 900) x 100 = 33,333...%.
    assert abs(float(data["stock_turnover_rate"]) - 33.333333) < 0.001


def test_dashboard_summary_returns_zero_turnover_with_empty_inventory(
    client,
    db,
):
    register_user(client)
    headers = get_auth_headers(client)

    create_product(
        db,
        name="Produto Sem Estoque",
        sku="DASH-010",
        current_stock=0,
        min_stock=2,
    )

    response = client.get(
        "/dashboard/summary?days=30",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert float(data["stock_turnover_rate"]) == 0