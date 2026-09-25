def test_admin_can_create_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product",
            "email": "admin-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Eletrônicos",
        description="Produtos eletrônicos",
        is_active=True,
    )

    supplier = Supplier(
        name="Fornecedor Eletrônicos",
        email="eletronicos@fornecedor.com",
        is_active=True,
    )

    db.add_all([category, supplier])
    db.commit()
    db.refresh(category)
    db.refresh(supplier)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Teclado Mecânico RGB",
            "sku": "TEC-RGB-001",
            "description": "Teclado mecânico com iluminação RGB",
            "category_id": category.id,
            "supplier_id": supplier.id,
            "cost_price": 180.00,
            "sale_price": 299.90,
            "min_stock": 5,
            "max_stock": 30,
            "unit": "UN",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Teclado Mecânico RGB"
    assert data["sku"] == "TEC-RGB-001"
    assert data["category_id"] == category.id
    assert data["supplier_id"] == supplier.id
    assert float(data["cost_price"]) == 180.00
    assert float(data["sale_price"]) == 299.90
    assert float(data["current_stock"]) == 0
    assert float(data["min_stock"]) == 5
    assert float(data["max_stock"]) == 30
    assert data["unit"] == "UN"
    assert data["is_active"] is True


def test_user_cannot_create_product(client):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Product",
            "email": "user-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Não Permitido",
            "sku": "PROD-USER-001",
            "cost_price": 50.00,
            "sale_price": 80.00,
            "current_stock": 5,
            "min_stock": 2,
            "unit": "UN",
        },
    )

    assert response.status_code == 403


def test_admin_cannot_create_product_with_nonexistent_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product Category",
            "email": "admin-product-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product-category@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Categoria Inexistente",
            "sku": "PROD-CAT-404",
            "category_id": 99999,
            "cost_price": 50.00,
            "sale_price": 80.00,
            "current_stock": 5,
            "min_stock": 2,
            "unit": "UN",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Category not found."


def test_admin_cannot_create_product_with_nonexistent_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product Supplier",
            "email": "admin-product-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Supplier 404",
        description="Categoria válida",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Supplier Inexistente",
            "sku": "PROD-SUP-404",
            "category_id": category.id,
            "supplier_id": 99999,
            "cost_price": 50.00,
            "sale_price": 80.00,
            "current_stock": 5,
            "min_stock": 2,
            "unit": "UN",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Supplier not found."

def test_admin_cannot_create_product_with_inactive_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product Inactive Category",
            "email": "admin-product-inactive-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product-inactive-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product-inactive-category@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Inativa",
        description="Categoria desativada",
        is_active=False,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Categoria Inativa",
            "sku": "PROD-CAT-INACTIVE",
            "category_id": category.id,
            "cost_price": 50.00,
            "sale_price": 80.00,
            "current_stock": 5,
            "min_stock": 2,
            "unit": "UN",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Category is inactive."


def test_admin_cannot_create_product_with_inactive_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product Inactive Supplier",
            "email": "admin-product-inactive-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product-inactive-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product-inactive-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Supplier Inativa",
        description="Categoria válida",
        is_active=True,
    )

    supplier = Supplier(
        name="Fornecedor Inativo",
        email="fornecedor-inativo@stockpilot.com",
        is_active=False,
    )

    db.add_all([category, supplier])
    db.commit()
    db.refresh(category)
    db.refresh(supplier)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Supplier Inativo",
            "sku": "PROD-SUP-INACTIVE",
            "category_id": category.id,
            "supplier_id": supplier.id,
            "cost_price": 50.00,
            "sale_price": 80.00,
            "current_stock": 5,
            "min_stock": 2,
            "unit": "UN",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Supplier is inactive."

def test_admin_cannot_create_product_with_duplicate_sku(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product Duplicate SKU",
            "email": "admin-product-duplicate-sku@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product-duplicate-sku@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product-duplicate-sku@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria SKU Duplicado",
        description="Categoria para teste de SKU",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    existing_product = Product(
        name="Produto Existente",
        sku="SKU-DUPLICADO-001",
        description="Produto já cadastrado",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=0,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(existing_product)
    db.commit()

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Novo Produto",
            "sku": "SKU-DUPLICADO-001",
            "description": "Tentativa de SKU duplicado",
            "category_id": category.id,
            "cost_price": 120.00,
            "sale_price": 180.00,
            "current_stock": 0,
            "min_stock": 5,
            "max_stock": 30,
            "unit": "UN",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "A product with this SKU already exists."


def test_admin_can_create_product_without_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Product No Supplier",
            "email": "admin-product-no-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-product-no-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-product-no-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Sem Supplier",
        description="Categoria para produto sem fornecedor",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Sem Supplier",
            "sku": "PROD-SEM-SUP-001",
            "description": "Produto sem fornecedor",
            "category_id": category.id,
            "cost_price": 50.00,
            "sale_price": 80.00,
            "current_stock": 0,
            "min_stock": 2,
            "max_stock": 20,
            "unit": "UN",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Produto Sem Supplier"
    assert data["sku"] == "PROD-SEM-SUP-001"
    assert data["category_id"] == category.id
    assert data["supplier_id"] is None
    assert float(data["current_stock"]) == 0
    assert data["is_active"] is True

def test_user_can_list_products(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User List Products",
            "email": "user-list-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-list-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria List Products",
        description="Categoria para listagem",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    products = [
        Product(
            name="Mouse Gamer",
            sku="MOUSE-GAMER-001",
            description="Mouse gamer",
            category_id=category.id,
            supplier_id=None,
            cost_price=80.00,
            sale_price=120.00,
            current_stock=10,
            min_stock=5,
            max_stock=30,
            unit="UN",
            is_active=True,
        ),
        Product(
            name="Teclado Mecânico",
            sku="TECLADO-MEC-001",
            description="Teclado mecânico",
            category_id=category.id,
            supplier_id=None,
            cost_price=150.00,
            sale_price=220.00,
            current_stock=5,
            min_stock=2,
            max_stock=20,
            unit="UN",
            is_active=True,
        ),
    ]

    db.add_all(products)
    db.commit()

    response = client.get(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "page" in data
    assert "page_size" in data
    assert "total" in data
    assert "total_pages" in data

    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total"] == 2
    assert data["total_pages"] == 1
    assert len(data["items"]) == 2


def test_admin_can_list_products(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin List Products",
            "email": "admin-list-products@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-list-products@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-list-products@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Admin List",
        description="Categoria para listagem admin",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Monitor 24",
        sku="MONITOR-24-001",
        description="Monitor 24 polegadas",
        category_id=category.id,
        supplier_id=None,
        cost_price=500.00,
        sale_price=750.00,
        current_stock=8,
        min_stock=3,
        max_stock=15,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()

    response = client.get(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Monitor 24"
    assert data["items"][0]["sku"] == "MONITOR-24-001"


def test_unauthenticated_user_cannot_list_products(client):
    response = client.get("/products")

    assert response.status_code == 401

def test_user_can_paginate_products(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Pagination Products",
            "email": "user-pagination-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-pagination-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria Paginação Products",
        description="Categoria para teste de paginação",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    products = [
        Product(
            name=f"Produto Paginação {index}",
            sku=f"PAGINACAO-{index:03d}",
            description=f"Produto {index}",
            category_id=category.id,
            supplier_id=None,
            cost_price=50.00,
            sale_price=80.00,
            current_stock=10,
            min_stock=2,
            max_stock=20,
            unit="UN",
            is_active=True,
        )
        for index in range(1, 6)
    ]

    db.add_all(products)
    db.commit()

    response = client.get(
        "/products?page=2&page_size=2",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 2
    assert data["page_size"] == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2


def test_user_can_search_products_by_name_or_sku(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Search Products",
            "email": "user-search-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-search-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria Busca Products",
        description="Categoria para busca",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    products = [
        Product(
            name="Mouse Gamer RGB",
            sku="MOUSE-RGB-001",
            description="Mouse gamer",
            category_id=category.id,
            supplier_id=None,
            cost_price=80.00,
            sale_price=120.00,
            current_stock=10,
            min_stock=2,
            max_stock=20,
            unit="UN",
            is_active=True,
        ),
        Product(
            name="Teclado Mecânico",
            sku="TECLADO-MEC-001",
            description="Teclado mecânico",
            category_id=category.id,
            supplier_id=None,
            cost_price=150.00,
            sale_price=220.00,
            current_stock=5,
            min_stock=2,
            max_stock=15,
            unit="UN",
            is_active=True,
        ),
    ]

    db.add_all(products)
    db.commit()

    response_by_name = client.get(
        "/products?search=Mouse",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response_by_name.status_code == 200

    data_by_name = response_by_name.json()

    assert data_by_name["total"] == 1
    assert len(data_by_name["items"]) == 1
    assert data_by_name["items"][0]["name"] == "Mouse Gamer RGB"

    response_by_sku = client.get(
        "/products?search=TECLADO-MEC-001",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response_by_sku.status_code == 200

    data_by_sku = response_by_sku.json()

    assert data_by_sku["total"] == 1
    assert len(data_by_sku["items"]) == 1
    assert data_by_sku["items"][0]["sku"] == "TECLADO-MEC-001"


def test_user_can_filter_products_by_active_status(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Filter Products",
            "email": "user-filter-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-filter-products@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria Filtro Products",
        description="Categoria para filtro",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    products = [
        Product(
            name="Produto Ativo",
            sku="ATIVO-001",
            description="Produto ativo",
            category_id=category.id,
            supplier_id=None,
            cost_price=50.00,
            sale_price=80.00,
            current_stock=10,
            min_stock=2,
            max_stock=20,
            unit="UN",
            is_active=True,
        ),
        Product(
            name="Produto Inativo",
            sku="INATIVO-001",
            description="Produto inativo",
            category_id=category.id,
            supplier_id=None,
            cost_price=50.00,
            sale_price=80.00,
            current_stock=10,
            min_stock=2,
            max_stock=20,
            unit="UN",
            is_active=False,
        ),
    ]

    db.add_all(products)
    db.commit()

    active_response = client.get(
        "/products?is_active=true",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert active_response.status_code == 200

    active_data = active_response.json()

    assert active_data["total"] == 1
    assert len(active_data["items"]) == 1
    assert active_data["items"][0]["name"] == "Produto Ativo"
    assert active_data["items"][0]["is_active"] is True

    inactive_response = client.get(
        "/products?is_active=false",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert inactive_response.status_code == 200

    inactive_data = inactive_response.json()

    assert inactive_data["total"] == 1
    assert len(inactive_data["items"]) == 1
    assert inactive_data["items"][0]["name"] == "Produto Inativo"
    assert inactive_data["items"][0]["is_active"] is False

def test_user_can_get_product_by_id(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Get Product",
            "email": "user-get-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-get-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria Get Product",
        description="Categoria para busca por ID",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Notebook Dell",
        sku="NOTEBOOK-DELL-001",
        description="Notebook para teste",
        category_id=category.id,
        supplier_id=None,
        cost_price=2500.00,
        sale_price=3500.00,
        current_stock=7,
        min_stock=2,
        max_stock=15,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.get(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product.id
    assert data["name"] == "Notebook Dell"
    assert data["sku"] == "NOTEBOOK-DELL-001"
    assert data["description"] == "Notebook para teste"
    assert data["category_id"] == category.id
    assert data["supplier_id"] is None
    assert float(data["cost_price"]) == 2500.00
    assert float(data["sale_price"]) == 3500.00
    assert float(data["current_stock"]) == 7
    assert float(data["min_stock"]) == 2
    assert float(data["max_stock"]) == 15
    assert data["unit"] == "UN"
    assert data["is_active"] is True


def test_get_nonexistent_product_returns_404(client):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Get Nonexistent Product",
            "email": "user-get-nonexistent-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-get-nonexistent-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.get(
        "/products/99999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found."


def test_unauthenticated_user_cannot_get_product(client):
    response = client.get("/products/1")

    assert response.status_code == 401

def test_admin_can_update_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Update Product",
            "email": "admin-update-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-update-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-update-product@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Update Product",
        description="Categoria original",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto Original",
        sku="PROD-UPDATE-001",
        description="Descrição original",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Atualizado",
            "description": "Descrição atualizada",
            "cost_price": 120.00,
            "sale_price": 180.00,
            "min_stock": 8,
            "max_stock": 40,
            "unit": "CX",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product.id
    assert data["name"] == "Produto Atualizado"
    assert data["sku"] == "PROD-UPDATE-001"
    assert data["description"] == "Descrição atualizada"
    assert float(data["cost_price"]) == 120.00
    assert float(data["sale_price"]) == 180.00
    assert float(data["current_stock"]) == 10
    assert float(data["min_stock"]) == 8
    assert float(data["max_stock"]) == 40
    assert data["unit"] == "CX"


def test_user_cannot_update_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Update Product",
            "email": "user-update-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-update-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria User Update",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto User Update",
        sku="PROD-USER-UPDATE-001",
        description="Produto original",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Tentativa de Alteração",
        },
    )

    assert response.status_code == 403

def test_admin_cannot_update_nonexistent_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Nonexistent Product",
            "email": "admin-nonexistent-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-nonexistent-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-nonexistent-product@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.patch(
        "/products/999999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Inexistente",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found."


def test_admin_cannot_update_product_with_duplicate_sku(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Duplicate SKU",
            "email": "admin-duplicate-sku@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-duplicate-sku@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-duplicate-sku@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Duplicate SKU",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product_1 = Product(
        name="Produto Um",
        sku="PROD-DUP-001",
        description="Produto um",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    product_2 = Product(
        name="Produto Dois",
        sku="PROD-DUP-002",
        description="Produto dois",
        category_id=category.id,
        supplier_id=None,
        cost_price=200.00,
        sale_price=300.00,
        current_stock=5,
        min_stock=2,
        max_stock=20,
        unit="UN",
        is_active=True,
    )

    db.add_all([product_1, product_2])
    db.commit()
    db.refresh(product_1)
    db.refresh(product_2)

    response = client.patch(
        f"/products/{product_2.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "sku": "PROD-DUP-001",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "A product with this SKU already exists."


def test_admin_cannot_update_product_with_nonexistent_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Update Category",
            "email": "admin-update-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-update-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-update-category@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Original Update",
        description="Categoria original",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto Update Category",
        sku="PROD-UPDATE-CATEGORY-001",
        description="Produto original",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "category_id": 999999,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Category not found."


def test_admin_cannot_update_product_with_inactive_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Inactive Category",
            "email": "admin-inactive-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-inactive-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-inactive-category@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    original_category = Category(
        name="Categoria Ativa Original",
        description="Categoria original",
        is_active=True,
    )

    inactive_category = Category(
        name="Categoria Inativa Update",
        description="Categoria inativa",
        is_active=False,
    )

    db.add_all([original_category, inactive_category])
    db.commit()
    db.refresh(original_category)
    db.refresh(inactive_category)

    product = Product(
        name="Produto Inactive Category",
        sku="PROD-INACTIVE-CATEGORY-001",
        description="Produto original",
        category_id=original_category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "category_id": inactive_category.id,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Category is inactive."


def test_admin_cannot_update_product_with_nonexistent_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Update Supplier",
            "email": "admin-update-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-update-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-update-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Update Supplier",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto Update Supplier",
        sku="PROD-UPDATE-SUPPLIER-001",
        description="Produto original",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "supplier_id": 999999,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Supplier not found."


def test_admin_cannot_update_product_with_inactive_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Inactive Supplier",
            "email": "admin-inactive-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-inactive-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-inactive-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Inactive Supplier",
        description="Categoria para teste",
        is_active=True,
    )

    inactive_supplier = Supplier(
        name="Fornecedor Inativo Update",
        email="fornecedor-inativo-update@stockpilot.com",
        phone="62999999999",
        document="123456789",
        address="Goiânia - GO",
        is_active=False,
    )

    db.add_all([category, inactive_supplier])
    db.commit()
    db.refresh(category)
    db.refresh(inactive_supplier)

    product = Product(
        name="Produto Inactive Supplier",
        sku="PROD-INACTIVE-SUPPLIER-001",
        description="Produto original",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "supplier_id": inactive_supplier.id,
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Supplier is inactive."

def test_admin_can_delete_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete Product",
            "email": "admin-delete-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-delete-product@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Delete Product",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto Para Excluir",
        sku="PROD-DELETE-001",
        description="Produto para teste de exclusão",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.delete(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 204

    db.refresh(product)

    assert product.is_active is False


def test_user_cannot_delete_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Delete Product",
            "email": "user-delete-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-delete-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria User Delete",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto User Delete",
        sku="PROD-USER-DELETE-001",
        description="Produto original",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.delete(
        f"/products/{product.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403

    db.refresh(product)

    assert product.is_active is True


def test_admin_cannot_delete_nonexistent_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete Nonexistent",
            "email": "admin-delete-nonexistent@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete-nonexistent@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-delete-nonexistent@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.delete(
        "/products/999999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found."


def test_admin_can_restore_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Restore Product",
            "email": "admin-restore-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-restore-product@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-restore-product@stockpilot.com"
    ).first()

    user.role = "ADMIN"

    category = Category(
        name="Categoria Restore Product",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto Para Restaurar",
        sku="PROD-RESTORE-001",
        description="Produto para teste de restauração",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=False,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product.id
    assert data["is_active"] is True

    db.refresh(product)

    assert product.is_active is True


def test_user_cannot_restore_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "User Restore Product",
            "email": "user-restore-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-restore-product@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product

    category = Category(
        name="Categoria User Restore",
        description="Categoria para teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto User Restore",
        sku="PROD-USER-RESTORE-001",
        description="Produto inativo",
        category_id=category.id,
        supplier_id=None,
        cost_price=100.00,
        sale_price=150.00,
        current_stock=10,
        min_stock=5,
        max_stock=30,
        unit="UN",
        is_active=False,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.patch(
        f"/products/{product.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403

    db.refresh(product)

    assert product.is_active is False


def test_admin_cannot_restore_nonexistent_product(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Restore Nonexistent",
            "email": "admin-restore-nonexistent@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-restore-nonexistent@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-restore-nonexistent@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.patch(
        "/products/999999/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found."

def test_admin_cannot_update_product_with_min_stock_above_max_stock(
    client,
    db,
):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Invalid Min",
            "email": "admin-invalid-min@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-invalid-min@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    category = Category(
        name="Categoria Invalid Min",
        description="Categoria para teste de min_stock",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    user = db.query(User).filter_by(
        email="admin-invalid-min@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    create_response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Min Inválido",
            "sku": "MIN-INVALID-001",
            "category_id": category.id,
            "cost_price": 10,
            "sale_price": 20,
            "min_stock": 5,
            "max_stock": 10,
        },
    )

    assert create_response.status_code == 201

    product_id = create_response.json()["id"]

    response = client.patch(
        f"/products/{product_id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "min_stock": 20,
        },
    )

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "max_stock must be greater than or equal to min_stock."
    )


def test_admin_cannot_update_product_with_max_stock_below_min_stock(
    client,
    db,
):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Invalid Max",
            "email": "admin-invalid-max@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-invalid-max@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    category = Category(
        name="Categoria Invalid Max",
        description="Categoria para teste de max_stock",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    user = db.query(User).filter_by(
        email="admin-invalid-max@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    create_response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Produto Max Inválido",
            "sku": "MAX-INVALID-001",
            "category_id": category.id,
            "cost_price": 10,
            "sale_price": 20,
            "min_stock": 20,
            "max_stock": 30,
        },
    )

    assert create_response.status_code == 201

    product_id = create_response.json()["id"]

    response = client.patch(
        f"/products/{product_id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "max_stock": 10,
        },
    )

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "max_stock must be greater than or equal to min_stock."
    )