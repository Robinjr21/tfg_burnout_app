def test_register_ok(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "nuevo@test.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "nuevo@test.com"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client, registered_user):
    response = client.post("/api/v1/auth/register", json={
        "email": "test@test.com",
        "password": "otrapassword123"
    })
    assert response.status_code == 400
    assert "registrado" in response.json()["detail"]


def test_register_invalid_email(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "no_es_un_email",
        "password": "password123"
    })
    assert response.status_code == 422


def test_login_ok(client, registered_user):
    response = client.post("/api/v1/auth/login", json=registered_user)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "noexiste@test.com",
        "password": "password123"
    })
    assert response.status_code == 401


def test_protected_route_without_token(client):
    response = client.get("/api/v1/entries/")
    assert response.status_code == 401  


def test_protected_route_invalid_token(client):
    response = client.get("/api/v1/entries/", headers={
        "Authorization": "Bearer token_invalido"
    })
    assert response.status_code == 401