def test_admin_can_create_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Categorias",
            "email": "admin-categorias@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-categorias@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    user = db.query(
        __import__("app.models.user", fromlist=["User"]).User
    ).filter_by(
        email="admin-categorias@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.post(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Eletrônicos",
            "description": "Produtos eletrônicos",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Eletrônicos"
    assert data["description"] == "Produtos eletrônicos"
    assert data["is_active"] is True
    assert data["id"] > 0

def test_user_cannot_create_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Categorias",
            "email": "user-categorias@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-categorias@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.post(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Eletrônicos",
            "description": "Produtos eletrônicos",
        },
    )

    assert response.status_code == 403

def test_user_can_list_categories(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Listagem",
            "email": "user-listagem@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-listagem@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    create_response = client.post(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Informática",
            "description": "Produtos de informática",
        },
    )

    # USER não pode criar categoria.
    assert create_response.status_code == 403

    # Criamos diretamente no banco para testar apenas a leitura.
    from app.models.category import Category

    category = Category(
        name="Informática",
        description="Produtos de informática",
        is_active=True,
    )

    db.add(category)
    db.commit()

    response = client.get(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Informática"
    assert data["items"][0]["description"] == "Produtos de informática"
    assert data["items"][0]["is_active"] is True

def test_cannot_list_categories_without_authentication(client, db):
    response = client.get("/categories")

    assert response.status_code == 401

def test_admin_can_update_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Update",
            "email": "admin-update@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-update@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-update@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Antiga",
        description="Descrição antiga",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Categoria Atualizada",
            "description": "Descrição atualizada",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == category.id
    assert data["name"] == "Categoria Atualizada"
    assert data["description"] == "Descrição atualizada"
    assert data["is_active"] is True

def test_user_cannot_update_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Update",
            "email": "user-update@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-update@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category

    category = Category(
        name="Categoria Protegida",
        description="Descrição original",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Tentativa de Alteração",
            "description": "Não deveria alterar",
        },
    )

    assert response.status_code == 403

def test_admin_cannot_update_nonexistent_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Categoria Inexistente",
            "email": "admin-inexistente@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-inexistente@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-inexistente@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.patch(
        "/categories/99999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Categoria Nova",
            "description": "Descrição nova",
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == "Category not found."

def test_admin_cannot_update_category_with_duplicate_name(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Categoria Duplicada",
            "email": "admin-duplicada@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-duplicada@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-duplicada@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category_one = Category(
        name="Eletrônicos",
        description="Categoria original",
        is_active=True,
    )

    category_two = Category(
        name="Informática",
        description="Outra categoria",
        is_active=True,
    )

    db.add_all([
        category_one,
        category_two,
    ])

    db.commit()

    db.refresh(category_one)
    db.refresh(category_two)

    response = client.patch(
        f"/categories/{category_two.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Eletrônicos",
            "description": "Tentativa de duplicação",
        },
    )

    assert response.status_code == 409

    assert response.json()["detail"] == (
        "A category with this name already exists."
    )

def test_admin_can_deactivate_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete",
            "email": "admin-delete@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-delete@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Para Desativar",
        description="Categoria de teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.delete(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 204

    db.refresh(category)

    assert category.is_active is False

def test_admin_cannot_deactivate_category_with_active_products(
    client,
    db,
):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Produto Categoria",
            "email": "admin-produto-categoria@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-produto-categoria@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-produto-categoria@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Com Produto",
        description="Categoria protegida",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        name="Produto Teste",
        sku="PROD-CATEG-001",
        description="Produto vinculado à categoria",
        category_id=category.id,
        supplier_id=None,
        cost_price=100,
        sale_price=150,
        current_stock=10,
        min_stock=2,
        max_stock=20,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()

    response = client.delete(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 409

    assert response.json()["detail"] == (
        "Cannot deactivate a category with active products."
    )

    db.refresh(category)

    assert category.is_active is True

def test_user_cannot_deactivate_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Delete",
            "email": "user-delete@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-delete@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category

    category = Category(
        name="Categoria Usuário Delete",
        description="Categoria de teste",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.delete(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403

    db.refresh(category)

    assert category.is_active is True

def test_admin_cannot_deactivate_nonexistent_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete Inexistente",
            "email": "admin-delete-inexistente@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete-inexistente@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-delete-inexistente@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.delete(
        "/categories/99999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == "Category not found."

def test_admin_can_restore_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Restore",
            "email": "admin-restore@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-restore@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-restore@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Restaurável",
        description="Categoria desativada",
        is_active=False,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == category.id
    assert data["name"] == "Categoria Restaurável"
    assert data["is_active"] is True

    db.refresh(category)

    assert category.is_active is True


def test_user_cannot_restore_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Restore",
            "email": "user-restore@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-restore@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category

    category = Category(
        name="Categoria Restore Protegida",
        description="Categoria desativada",
        is_active=False,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403

    db.refresh(category)

    assert category.is_active is False


def test_admin_cannot_restore_active_category(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Restore Ativa",
            "email": "admin-restore-ativa@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-restore-ativa@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-restore-ativa@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Já Ativa",
        description="Categoria ativa",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Category is already active."
    )

def test_admin_can_create_category_with_trimmed_name(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Trim Create",
            "email": "admin-trim-create@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-trim-create@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-trim-create@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.post(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "  Eletrônicos  ",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Eletrônicos"


def test_admin_cannot_create_category_with_empty_name(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Empty Category",
            "email": "admin-empty-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-empty-category@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-empty-category@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.post(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "   ",
        },
    )

    assert response.status_code == 422


def test_admin_cannot_create_category_with_duplicate_name_case_insensitive(
    client,
    db,
):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Duplicate Create",
            "email": "admin-duplicate-create@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-duplicate-create@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-duplicate-create@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Eletrônicos",
        description="Categoria original",
        is_active=True,
    )

    db.add(category)
    db.commit()

    response = client.post(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "eletrônicos",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "A category with this name already exists."
    )


def test_admin_can_update_category_with_trimmed_name(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Trim Update",
            "email": "admin-trim-update@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-trim-update@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-trim-update@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Original",
        description="Descrição original",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "  Categoria Atualizada  ",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Categoria Atualizada"


def test_admin_cannot_update_category_with_empty_name(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Empty Update",
            "email": "admin-empty-update@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-empty-update@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-empty-update@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Original",
        description="Descrição original",
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    response = client.patch(
        f"/categories/{category.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "   ",
        },
    )

    assert response.status_code == 422

def test_user_can_filter_and_paginate_categories(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Filtros",
            "email": "user-filtros@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-filtros@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.category import Category

    categories = [
        Category(
            name="Eletrônicos",
            description="Produtos eletrônicos",
            is_active=True,
        ),
        Category(
            name="Informática",
            description="Produtos de informática",
            is_active=True,
        ),
        Category(
            name="Eletrônicos Antigos",
            description="Categoria desativada",
            is_active=False,
        ),
        Category(
            name="Móveis",
            description="Produtos para escritório",
            is_active=True,
        ),
    ]

    db.add_all(categories)
    db.commit()

    search_response = client.get(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        params={
            "search": "eletrônicos",
        },
    )

    assert search_response.status_code == 200

    search_data = search_response.json()

    assert search_data["total"] == 2
    assert search_data["total_pages"] == 1
    assert len(search_data["items"]) == 2

    assert search_data["items"][0]["name"] == "Eletrônicos"
    assert search_data["items"][1]["name"] == "Eletrônicos Antigos"

    active_response = client.get(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        params={
            "is_active": True,
        },
    )

    assert active_response.status_code == 200

    active_data = active_response.json()

    assert active_data["total"] == 3

    assert all(
        category["is_active"] is True
        for category in active_data["items"]
    )

    pagination_response = client.get(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        params={
            "page": 1,
            "page_size": 2,
        },
    )

    assert pagination_response.status_code == 200

    pagination_data = pagination_response.json()

    assert pagination_data["page"] == 1
    assert pagination_data["page_size"] == 2
    assert pagination_data["total"] == 4
    assert pagination_data["total_pages"] == 2
    assert len(pagination_data["items"]) == 2

    assert pagination_data["items"][0]["name"] == "Eletrônicos"
    assert pagination_data["items"][1]["name"] == "Eletrônicos Antigos"

    second_page_response = client.get(
        "/categories",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        params={
            "page": 2,
            "page_size": 2,
        },
    )

    assert second_page_response.status_code == 200

    second_page_data = second_page_response.json()

    assert second_page_data["page"] == 2
    assert second_page_data["page_size"] == 2
    assert second_page_data["total"] == 4
    assert second_page_data["total_pages"] == 2
    assert len(second_page_data["items"]) == 2

    assert second_page_data["items"][0]["name"] == "Informática"
    assert second_page_data["items"][1]["name"] == "Móveis"

