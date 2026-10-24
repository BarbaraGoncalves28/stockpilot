def test_admin_can_create_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Supplier",
            "email": "admin-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.post(
        "/suppliers",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Fornecedor Tech",
            "email": "contato@fornecedortech.com",
            "phone": "(62) 99999-9999",
            "document": "12.345.678/0001-90",
            "address": "Goiânia - GO",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Fornecedor Tech"
    assert data["email"] == "contato@fornecedortech.com"
    assert data["phone"] == "(62) 99999-9999"
    assert data["document"] == "12.345.678/0001-90"
    assert data["address"] == "Goiânia - GO"
    assert data["is_active"] is True


def test_user_cannot_create_supplier(client):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Supplier",
            "email": "user-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.post(
        "/suppliers",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Fornecedor Não Permitido",
            "email": "nao-permitido@fornecedor.com",
        },
    )

    assert response.status_code == 403

def test_user_can_list_suppliers(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário List Supplier",
            "email": "user-list-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-list-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier

    supplier_one = Supplier(
        name="Fornecedor Alpha",
        email="alpha@fornecedor.com",
        phone="(62) 99999-1111",
        document="11.111.111/0001-11",
        address="Goiânia - GO",
        is_active=True,
    )

    supplier_two = Supplier(
        name="Fornecedor Beta",
        email="beta@fornecedor.com",
        phone="(62) 99999-2222",
        document="22.222.222/0001-22",
        address="Aparecida de Goiânia - GO",
        is_active=True,
    )

    db.add_all([supplier_one, supplier_two])
    db.commit()

    response = client.get(
        "/suppliers",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total"] == 2
    assert data["total_pages"] == 1
    assert len(data["items"]) == 2

    names = {item["name"] for item in data["items"]}

    assert "Fornecedor Alpha" in names
    assert "Fornecedor Beta" in names


def test_admin_can_list_suppliers(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin List Supplier",
            "email": "admin-list-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-list-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-list-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    supplier = Supplier(
        name="Fornecedor Admin",
        email="admin@fornecedor.com",
        is_active=True,
    )

    db.add(supplier)
    db.commit()

    response = client.get(
        "/suppliers",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Fornecedor Admin"


def test_unauthenticated_user_cannot_list_suppliers(client):
    response = client.get("/suppliers")

    assert response.status_code == 401

def test_user_can_get_supplier_by_id(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Get Supplier",
            "email": "user-get-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-get-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier

    supplier = Supplier(
        name="Fornecedor Individual",
        email="individual@fornecedor.com",
        phone="(62) 99999-3333",
        document="33.333.333/0001-33",
        address="Goiânia - GO",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.get(
        f"/suppliers/{supplier.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == supplier.id
    assert data["name"] == "Fornecedor Individual"
    assert data["email"] == "individual@fornecedor.com"
    assert data["phone"] == "(62) 99999-3333"
    assert data["document"] == "33.333.333/0001-33"
    assert data["address"] == "Goiânia - GO"
    assert data["is_active"] is True


def test_get_nonexistent_supplier_returns_404(client):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Supplier 404",
            "email": "user-supplier-404@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-supplier-404@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.get(
        "/suppliers/99999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Supplier not found."


def test_unauthenticated_user_cannot_get_supplier(client, db):
    from app.models.supplier import Supplier
    from app.models.user import User

    register_response = client.post(
        "/auth/register",
        json={
            "name": "Proprietario do Fornecedor",
            "email": "proprietario-fornecedor@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    owner = db.query(User).filter_by(
        email="proprietario-fornecedor@stockpilot.com"
    ).first()

    assert owner is not None

    supplier = Supplier(
        owner_id=owner.id,
        name="Fornecedor Protegido",
        email="protegido@fornecedor.com",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.get(f"/suppliers/{supplier.id}")

    assert response.status_code == 401

def test_admin_can_update_supplier(client, db):
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

    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-update-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    supplier = Supplier(
        name="Fornecedor Original",
        email="original@fornecedor.com",
        phone="(62) 99999-1111",
        document="11.111.111/0001-11",
        address="Goiânia - GO",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.patch(
        f"/suppliers/{supplier.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Fornecedor Atualizado",
            "email": "atualizado@fornecedor.com",
            "phone": "(62) 99999-9999",
            "document": "99.999.999/0001-99",
            "address": "Aparecida de Goiânia - GO",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == supplier.id
    assert data["name"] == "Fornecedor Atualizado"
    assert data["email"] == "atualizado@fornecedor.com"
    assert data["phone"] == "(62) 99999-9999"
    assert data["document"] == "99.999.999/0001-99"
    assert data["address"] == "Aparecida de Goiânia - GO"
    assert data["is_active"] is True


def test_user_cannot_update_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Update Supplier",
            "email": "user-update-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-update-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier

    supplier = Supplier(
        name="Fornecedor Protegido Update",
        email="protegido-update@fornecedor.com",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.patch(
        f"/suppliers/{supplier.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Tentativa de Atualização",
        },
    )

    assert response.status_code == 403


def test_update_nonexistent_supplier_returns_404(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Update 404",
            "email": "admin-update-404@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-update-404@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-update-404@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.patch(
        "/suppliers/99999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Fornecedor Inexistente",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Supplier not found."


def test_admin_cannot_update_supplier_to_duplicate_name(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Duplicate Supplier",
            "email": "admin-duplicate-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-duplicate-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-duplicate-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    supplier_one = Supplier(
        name="Fornecedor Existente",
        email="existente@fornecedor.com",
        is_active=True,
    )

    supplier_two = Supplier(
        name="Fornecedor Original",
        email="original@fornecedor.com",
        is_active=True,
    )

    db.add_all([supplier_one, supplier_two])
    db.commit()
    db.refresh(supplier_two)

    response = client.patch(
        f"/suppliers/{supplier_two.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "name": "Fornecedor Existente",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "A supplier with this name already exists."

def test_admin_can_deactivate_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete Supplier",
            "email": "admin-delete-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-delete-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    supplier = Supplier(
        name="Fornecedor Para Desativar",
        email="desativar@fornecedor.com",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.delete(
        f"/suppliers/{supplier.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 204

    db.refresh(supplier)

    assert supplier.is_active is False


def test_user_cannot_deactivate_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Delete Supplier",
            "email": "user-delete-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-delete-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier

    supplier = Supplier(
        name="Fornecedor Protegido Delete",
        email="protegido-delete@fornecedor.com",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.delete(
        f"/suppliers/{supplier.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403

    db.refresh(supplier)

    assert supplier.is_active is True


def test_admin_cannot_deactivate_nonexistent_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete 404 Supplier",
            "email": "admin-delete-404-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete-404-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-delete-404-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    response = client.delete(
        "/suppliers/99999",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Supplier not found."


def test_admin_cannot_deactivate_supplier_with_active_products(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Delete Product Supplier",
            "email": "admin-delete-product-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-delete-product-supplier@stockpilot.com",
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
        email="admin-delete-product-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    category = Category(
        name="Categoria Delete Supplier",
        description="Categoria para teste",
        is_active=True,
    )

    supplier = Supplier(
        name="Fornecedor Com Produto Ativo",
        email="produto-ativo@fornecedor.com",
        is_active=True,
    )

    db.add_all([category, supplier])
    db.commit()

    product = Product(
        name="Produto Vinculado",
        sku="PROD-SUP-001",
        description="Produto ativo vinculado ao fornecedor",
        category_id=category.id,
        supplier_id=supplier.id,
        cost_price=100,
        sale_price=150,
        current_stock=10,
        min_stock=2,
        max_stock=30,
        unit="UN",
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(supplier)

    response = client.delete(
        f"/suppliers/{supplier.id}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 409

    assert response.json()["detail"] == (
        "Cannot deactivate a supplier with active products."
    )

    db.refresh(supplier)

    assert supplier.is_active is True

def test_admin_can_restore_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Restore Supplier",
            "email": "admin-restore-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-restore-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-restore-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    supplier = Supplier(
        name="Fornecedor Restaurável",
        email="restauravel@fornecedor.com",
        is_active=False,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.patch(
        f"/suppliers/{supplier.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == supplier.id
    assert data["name"] == "Fornecedor Restaurável"
    assert data["is_active"] is True

    db.refresh(supplier)

    assert supplier.is_active is True


def test_user_cannot_restore_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Restore Supplier",
            "email": "user-restore-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "user-restore-supplier@stockpilot.com",
            "password": "SenhaUser123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier

    supplier = Supplier(
        name="Fornecedor Restore Protegido",
        email="restore-protegido@fornecedor.com",
        is_active=False,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.patch(
        f"/suppliers/{supplier.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 403

    db.refresh(supplier)

    assert supplier.is_active is False


def test_admin_cannot_restore_active_supplier(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Admin Restore Ativo Supplier",
            "email": "admin-restore-ativo-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin-restore-ativo-supplier@stockpilot.com",
            "password": "SenhaAdmin123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    from app.models.supplier import Supplier
    from app.models.user import User

    user = db.query(User).filter_by(
        email="admin-restore-ativo-supplier@stockpilot.com"
    ).first()

    user.role = "ADMIN"
    db.commit()

    supplier = Supplier(
        name="Fornecedor Já Ativo",
        email="ja-ativo@fornecedor.com",
        is_active=True,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    response = client.patch(
        f"/suppliers/{supplier.id}/restore",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Supplier is already active."
    )

