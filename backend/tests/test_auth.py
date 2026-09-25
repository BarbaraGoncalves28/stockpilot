def test_register_user(client, db):
    response = client.post(
        "/auth/register",
        json={
            "name": "Usuário Teste",
            "email": "teste@stockpilot.com",
            "password": "SenhaTeste123",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Usuário Teste"
    assert data["email"] == "teste@stockpilot.com"
    assert data["role"] == "USER"
    assert data["is_active"] is True

    assert "password" not in data
    assert "password_hash" not in data


def test_login_user(client, db):
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Login Teste",
            "email": "login@stockpilot.com",
            "password": "SenhaLogin123",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={
            "email": "login@stockpilot.com",
            "password": "SenhaLogin123",
        },
    )

    assert login_response.status_code == 200

    data = login_response.json()

    assert data["access_token"]
    assert data["refresh_token"]
    assert data["token_type"] == "bearer"

    assert data["user"]["name"] == "Login Teste"
    assert data["user"]["email"] == "login@stockpilot.com"
    assert data["user"]["role"] == "USER"


def test_login_with_wrong_password(client, db):
    client.post(
        "/auth/register",
        json={
            "name": "Senha Incorreta",
            "email": "senha@stockpilot.com",
            "password": "SenhaCorreta123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "senha@stockpilot.com",
            "password": "SenhaErrada123",
        },
    )

    assert response.status_code == 401


def test_login_with_unknown_email(client, db):
    response = client.post(
        "/auth/login",
        json={
            "email": "naoexiste@stockpilot.com",
            "password": "SenhaTeste123",
        },
    )

    assert response.status_code == 401


def test_register_duplicate_email(client, db):
    payload = {
        "name": "Usuário Duplicado",
        "email": "duplicado@stockpilot.com",
        "password": "SenhaDuplicada123",
    }

    first_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert second_response.status_code == 409

def test_get_current_user(client, db):
    client.post(
        "/auth/register",
        json={
            "name": "Usuário Atual",
            "email": "me@stockpilot.com",
            "password": "SenhaAtual123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "me@stockpilot.com",
            "password": "SenhaAtual123",
        },
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Usuário Atual"
    assert data["email"] == "me@stockpilot.com"
    assert data["role"] == "USER"
    assert data["is_active"] is True


def test_get_current_user_without_token(client, db):
    response = client.get("/auth/me")

    assert response.status_code == 401

def test_refresh_token(client, db):
    client.post(
        "/auth/register",
        json={
            "name": "Refresh Teste",
            "email": "refresh@stockpilot.com",
            "password": "SenhaRefresh123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "refresh@stockpilot.com",
            "password": "SenhaRefresh123",
        },
    )

    assert login_response.status_code == 200

    refresh_token = login_response.json()["refresh_token"]

    response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert data["token_type"] == "bearer"

    me_response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {data['access_token']}",
        },
    )

    assert me_response.status_code == 200

    me_data = me_response.json()

    assert me_data["email"] == "refresh@stockpilot.com"
    assert me_data["role"] == "USER"

def test_logout(client, db):
    client.post(
        "/auth/register",
        json={
            "name": "Logout Teste",
            "email": "logout@stockpilot.com",
            "password": "SenhaLogout123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "logout@stockpilot.com",
            "password": "SenhaLogout123",
        },
    )

    assert login_response.status_code == 200

    refresh_token = login_response.json()["refresh_token"]

    response = client.post(
        "/auth/logout",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert response.status_code == 204

def test_refresh_token_after_logout(client, db):
    client.post(
        "/auth/register",
        json={
            "name": "Revogação Teste",
            "email": "revogacao@stockpilot.com",
            "password": "SenhaRevogacao123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "revogacao@stockpilot.com",
            "password": "SenhaRevogacao123",
        },
    )

    assert login_response.status_code == 200

    refresh_token = login_response.json()["refresh_token"]

    logout_response = client.post(
        "/auth/logout",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert logout_response.status_code == 204

    refresh_response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert refresh_response.status_code == 401

    assert refresh_response.json()["detail"] == (
        "Refresh token has been revoked."
    )

