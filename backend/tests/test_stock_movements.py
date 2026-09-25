from decimal import Decimal

from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier


def create_category(db):
    category = Category(
        name="Eletrônicos",
        description="Produtos eletrônicos",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def create_supplier(db):
    supplier = Supplier(
        name="Fornecedor Teste",
        email="fornecedor@example.com",
        phone="62999999999",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def create_product(db, stock=0, sku="TEST-001"):
    category = db.query(Category).filter(
        Category.name == "Eletrônicos"
    ).first()

    if not category:
        category = create_category(db)

    supplier = db.query(Supplier).filter(
        Supplier.name == "Fornecedor Teste"
    ).first()

    if not supplier:
        supplier = create_supplier(db)

    product = Product(
        name=f"Produto {sku}",
        sku=sku,
        description="Produto para teste",
        category_id=category.id,
        supplier_id=supplier.id,
        cost_price=100,
        sale_price=150,
        current_stock=stock,
        min_stock=5,
        max_stock=100,
        unit="UN",
        is_active=True,
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

    assert response.status_code == 201



    return response


def login(client, email):
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "12345678",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def auth_headers(token):
    return {
        "Authorization": f"Bearer {token}",
    }


def test_user_can_create_stock_entry(client, db):
    register_user(client, "user-entry@example.com")
    token = login(client, "user-entry@example.com")

    product = create_product(db)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 10,
            "reason": "Compra",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["product_id"] == product.id
    assert data["movement_type"] == "IN"
    assert float(data["quantity"]) == 10
    assert float(data["previous_stock"]) == 0
    assert float(data["new_stock"]) == 10


def test_user_can_create_stock_exit(client, db):
    register_user(client, "user-exit@example.com")
    token = login(client, "user-exit@example.com")

    product = create_product(db, stock=20)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "OUT",
            "quantity": 5,
            "reason": "Venda",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["product_id"] == product.id
    assert data["movement_type"] == "OUT"
    assert float(data["quantity"]) == 5
    assert float(data["previous_stock"]) == 20
    assert float(data["new_stock"]) == 15


def test_user_cannot_create_stock_exit_above_available_stock(client, db):
    register_user(client, "user-stock@example.com")
    token = login(client, "user-stock@example.com")

    product = create_product(db, stock=5)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "OUT",
            "quantity": 10,
            "reason": "Venda",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 400


def test_user_cannot_create_stock_adjustment(client, db):
    register_user(client, "user-adjustment@example.com")
    token = login(client, "user-adjustment@example.com")

    product = create_product(db, stock=10)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "ADJUSTMENT",
            "quantity": 20,
            "reason": "Inventário",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 403

def test_admin_can_create_stock_adjustment(client, db):
    response = client.post(
        "/auth/register",
        json={
            "name": "Administrador Teste",
            "email": "admin-adjustment@example.com",
            "password": "12345678",
        },
    )

    assert response.status_code == 201

    user_id = response.json()["id"]

    from app.models.user import User

    user = db.get(User, user_id)
    user.role = "ADMIN"

    db.commit()

    token = login(client, "admin-adjustment@example.com")

    product = create_product(db, stock=10)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "ADJUSTMENT",
            "quantity": 20,
            "reason": "Inventário",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["product_id"] == product.id
    assert data["movement_type"] == "ADJUSTMENT"
    assert float(data["quantity"]) == 20
    assert float(data["previous_stock"]) == 10
    assert float(data["new_stock"]) == 20

def test_stock_movement_updates_product_stock(client, db):
    register_user(client, "user-stock-update@example.com")
    token = login(client, "user-stock-update@example.com")

    product = create_product(db, stock=10)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 15,
            "reason": "Reposição",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    db.refresh(product)

    assert float(product.current_stock) == 25

def test_cannot_create_stock_movement_with_nonexistent_product(client, db):
    register_user(client, "user-nonexistent-product@example.com")
    token = login(client, "user-nonexistent-product@example.com")

    response = client.post(
        "/stock-movements",
        json={
            "product_id": 99999,
            "movement_type": "IN",
            "quantity": 10,
            "reason": "Compra",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 400


def test_cannot_create_stock_movement_for_inactive_product(client, db):
    register_user(client, "user-inactive-product@example.com")
    token = login(client, "user-inactive-product@example.com")

    product = create_product(db)

    product.is_active = False
    db.commit()

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 10,
            "reason": "Compra",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 400


def test_cannot_create_stock_movement_with_invalid_quantity(client, db):
    register_user(client, "user-invalid-quantity@example.com")
    token = login(client, "user-invalid-quantity@example.com")

    product = create_product(db)

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 0,
            "reason": "Compra",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 422

def test_cannot_create_stock_movement_with_negative_quantity(client, db):
    register_user(client, "negative@example.com")
    token = login(client, "negative@example.com")

    product = create_product(db, stock=10)

    response = client.post(
        "/stock-movements",
        headers=auth_headers(token),
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": -5,
        },
    )

    assert response.status_code == 422

def test_cannot_create_stock_movement_with_invalid_type(client, db):
    register_user(client, "invalid-type@example.com")
    token = login(client, "invalid-type@example.com")

    product = create_product(db, stock=10)

    response = client.post(
        "/stock-movements",
        headers=auth_headers(token),
        json={
            "product_id": product.id,
            "movement_type": "INVALID",
            "quantity": 5,
        },
    )

    assert response.status_code == 422

def test_user_can_list_stock_movements(client, db):
    register_user(client, "list@example.com")
    token = login(client, "list@example.com")

    product = create_product(db, stock=10)

    create_response = client.post(
        "/stock-movements",
        headers=auth_headers(token),
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 5,
        },
    )

    assert create_response.status_code == 201

    response = client.get(
        "/stock-movements",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total"] == 1
    assert data["total_pages"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == product.id
    assert data["items"][0]["movement_type"] == "IN"
    assert float(data["items"][0]["quantity"]) == 5


def test_user_can_filter_stock_movements_by_product(client, db):
    register_user(client, "filter-product@example.com")
    token = login(client, "filter-product@example.com")

    product_1 = create_product(
        db,
        stock=10,
        sku="TEST-001",
    )

    product_2 = create_product(
        db,
        stock=20,
        sku="TEST-002",
    )

    for product_id, movement_type in [
        (product_1.id, "IN"),
        (product_2.id, "OUT"),
        (product_1.id, "OUT"),
    ]:
        response = client.post(
            "/stock-movements",
            headers=auth_headers(token),
            json={
                "product_id": product_id,
                "movement_type": movement_type,
                "quantity": 5,
            },
        )

        assert response.status_code == 201

    response = client.get(
        f"/stock-movements?product_id={product_1.id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert len(data["items"]) == 2

    assert all(
        item["product_id"] == product_1.id
        for item in data["items"]
    )


def test_user_can_filter_stock_movements_by_type(client, db):
    register_user(client, "filter-type@example.com")
    token = login(client, "filter-type@example.com")

    product = create_product(
        db,
        stock=10,
        sku="TEST-003",
    )

    for movement_type in ["IN", "IN", "OUT"]:
        response = client.post(
            "/stock-movements",
            headers=auth_headers(token),
            json={
                "product_id": product.id,
                "movement_type": movement_type,
                "quantity": 2,
            },
        )

        assert response.status_code == 201

    response = client.get(
        "/stock-movements?movement_type=IN",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert len(data["items"]) == 2

    assert all(
        item["movement_type"] == "IN"
        for item in data["items"]
    )

def test_stock_movements_pagination(client, db):
    register_user(client, "pagination@example.com")
    token = login(client, "pagination@example.com")

    product = create_product(
        db,
        stock=10,
        sku="TEST-PAGINATION",
    )

    for _ in range(5):
        response = client.post(
            "/stock-movements",
            headers=auth_headers(token),
            json={
                "product_id": product.id,
                "movement_type": "IN",
                "quantity": 1,
            },
        )

        assert response.status_code == 201

    response = client.get(
        "/stock-movements?page=2&page_size=2",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 2
    assert data["page_size"] == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2


def test_user_can_list_movements_by_product(client, db):
    register_user(client, "product-history@example.com")
    token = login(client, "product-history@example.com")

    product_1 = create_product(
        db,
        stock=10,
        sku="TEST-HISTORY-001",
    )

    product_2 = create_product(
        db,
        stock=10,
        sku="TEST-HISTORY-002",
    )

    for product_id in [product_1.id, product_1.id, product_2.id]:
        response = client.post(
            "/stock-movements",
            headers=auth_headers(token),
            json={
                "product_id": product_id,
                "movement_type": "IN",
                "quantity": 2,
            },
        )

        assert response.status_code == 201

    response = client.get(
        f"/stock-movements/product/{product_1.id}",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2

    assert all(
        movement["product_id"] == product_1.id
        for movement in data
    )


def test_user_can_filter_stock_movements_by_date(client, db):
    register_user(client, "filter-date@example.com")
    token = login(client, "filter-date@example.com")

    product = create_product(
        db,
        stock=10,
        sku="TEST-DATE",
    )

    response = client.post(
        "/stock-movements",
        headers=auth_headers(token),
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 5,
        },
    )

    assert response.status_code == 201

    response = client.get(
        "/stock-movements"
        "?start_date=2020-01-01"
        "&end_date=2020-01-02",
        headers=auth_headers(token),
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 0
    assert data["items"] == []

def test_unauthenticated_user_cannot_list_stock_movements(client):
    response = client.get("/stock-movements")

    assert response.status_code == 401


def test_unauthenticated_user_cannot_list_product_movements(
    client,
    db,
):
    category = create_category(db)

    product = Product(
        name="Produto Histórico",
        sku="HIST-001",
        category_id=category.id,
        cost_price=Decimal("10.00"),
        sale_price=Decimal("20.00"),
        current_stock=Decimal("10.000"),
        min_stock=Decimal("2.000"),
        max_stock=Decimal("50.000"),
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.get(
        f"/stock-movements/product/{product.id}"
    )

    assert response.status_code == 401


def test_stock_movements_reject_invalid_page(client):
    register_user(client, "invalid-page@example.com")
    token = login(client, "invalid-page@example.com")

    response = client.get(
        "/stock-movements?page=0",
        headers=auth_headers(token),
    )

    assert response.status_code == 422


def test_stock_movements_reject_invalid_page_size(client):
    register_user(client, "invalid-page-size@example.com")
    token = login(client, "invalid-page-size@example.com")

    response = client.get(
        "/stock-movements?page_size=101",
        headers=auth_headers(token),
    )

    assert response.status_code == 422


def test_stock_movements_reject_invalid_product_filter(client):
    register_user(client, "invalid-product-filter@example.com")
    token = login(client, "invalid-product-filter@example.com")

    response = client.get(
        "/stock-movements?product_id=0",
        headers=auth_headers(token),
    )

    assert response.status_code == 422


def test_stock_movements_reject_invalid_movement_type(client):
    register_user(client, "invalid-filter-type@example.com")
    token = login(client, "invalid-filter-type@example.com")

    response = client.get(
        "/stock-movements?movement_type=INVALID",
        headers=auth_headers(token),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "movement_type must be IN, OUT or ADJUSTMENT."
    )


def test_stock_movements_normalize_movement_type_filter(
    client,
    db,
):
    register_user(client, "normalize-filter@example.com")
    token = login(client, "normalize-filter@example.com")

    product = create_product(
        db,
        sku="FILTER-TYPE-001",
    )

    create_response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 10,
        },
        headers=auth_headers(token),
    )

    assert create_response.status_code == 201

    response = client.get(
        "/stock-movements?movement_type=%20in%20",
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json()["total"] >= 1

    items = response.json()["items"]

    assert all(
        item["movement_type"] == "IN"
        for item in items
    )


def test_stock_movements_reject_invalid_date_range(client):
    register_user(client, "invalid-date-range@example.com")
    token = login(client, "invalid-date-range@example.com")

    response = client.get(
        "/stock-movements"
        "?start_date=2026-09-20"
        "&end_date=2026-09-19",
        headers=auth_headers(token),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "start_date must be before or equal to end_date."
    )


def test_stock_movements_reject_invalid_date_format(client):
    register_user(client, "invalid-date-format@example.com")
    token = login(client, "invalid-date-format@example.com")

    response = client.get(
        "/stock-movements?start_date=invalid-date",
        headers=auth_headers(token),
    )

    assert response.status_code == 422


def test_stock_movements_decimal_quantity(client, db):
    register_user(client, "decimal-quantity@example.com")
    token = login(client, "decimal-quantity@example.com")

    product = create_product(
        db,
        sku="DECIMAL-001",
    )

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": "2.500",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    data = response.json()

    assert Decimal(data["quantity"]) == Decimal("2.500")
    assert Decimal(data["previous_stock"]) == Decimal("0.000")
    assert Decimal(data["new_stock"]) == Decimal("2.500")


def test_stock_movement_preserves_reason_and_notes(client, db):
    register_user(client, "reason-notes@example.com")
    token = login(client, "reason-notes@example.com")

    product = create_product(
        db,
        sku="REASON-NOTES-001",
    )

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "IN",
            "quantity": 5,
            "reason": "Reposição de estoque",
            "notes": "Compra realizada com fornecedor principal.",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["reason"] == "Reposição de estoque"
    assert data["notes"] == (
        "Compra realizada com fornecedor principal."
    )


def test_failed_stock_exit_does_not_change_stock_or_create_movement(
    client,
    db,
):
    register_user(client, "failed-exit@example.com")
    token = login(client, "failed-exit@example.com")

    product = create_product(
        db,
        stock=10,
        sku="FAILED-EXIT-001",
    )

    response = client.post(
        "/stock-movements",
        json={
            "product_id": product.id,
            "movement_type": "OUT",
            "quantity": 11,
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 400

    db.refresh(product)

    assert Decimal(product.current_stock) == Decimal("10.000")

    history_response = client.get(
        f"/stock-movements/product/{product.id}",
        headers=auth_headers(token),
    )

    assert history_response.status_code == 200
    assert history_response.json() == []