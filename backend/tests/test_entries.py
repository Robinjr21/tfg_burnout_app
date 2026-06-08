def test_create_entry_ok(client, auth_headers):
    response = client.post("/api/v1/entries/", json={
        "content": "Hoy me siento bien y con energia."
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Hoy me siento bien y con energia."
    assert data["analyzed"] == False
    assert data["word_count"] == 7
    assert "id" in data


def test_create_entry_empty(client, auth_headers):
    response = client.post("/api/v1/entries/", json={
        "content": "   "
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_entry_too_long(client, auth_headers):
    response = client.post("/api/v1/entries/", json={
        "content": "palabra " * 1000
    }, headers=auth_headers)
    assert response.status_code == 422


def test_list_entries_empty(client, auth_headers):
    response = client.get("/api/v1/entries/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["entries"] == []


def test_list_entries_with_data(client, auth_headers):
    # Crear dos entradas
    client.post("/api/v1/entries/", json={"content": "Primera entrada."}, headers=auth_headers)
    client.post("/api/v1/entries/", json={"content": "Segunda entrada."}, headers=auth_headers)

    response = client.get("/api/v1/entries/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["entries"]) == 2


def test_get_entry_ok(client, auth_headers):
    create = client.post("/api/v1/entries/", json={
        "content": "Entrada de prueba."
    }, headers=auth_headers)
    entry_id = create.json()["id"]

    response = client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == entry_id


def test_get_entry_not_found(client, auth_headers):
    response = client.get("/api/v1/entries/id-inexistente", headers=auth_headers)
    assert response.status_code == 404


def test_delete_entry_ok(client, auth_headers):
    create = client.post("/api/v1/entries/", json={
        "content": "Entrada a eliminar."
    }, headers=auth_headers)
    entry_id = create.json()["id"]

    response = client.delete(f"/api/v1/entries/{entry_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verificar que ya no existe
    response = client.get(f"/api/v1/entries/{entry_id}", headers=auth_headers)
    assert response.status_code == 404


def test_delete_entry_otro_usuario(client, auth_headers):
    # Crear entrada con usuario 1
    create = client.post("/api/v1/entries/", json={
        "content": "Entrada privada."
    }, headers=auth_headers)
    entry_id = create.json()["id"]

    # Registrar y loguear usuario 2
    client.post("/api/v1/auth/register", json={
        "email": "otro@test.com",
        "password": "password123"
    })
    login = client.post("/api/v1/auth/login", json={
        "email": "otro@test.com",
        "password": "password123"
    })
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    # Usuario 2 intenta eliminar entrada de usuario 1
    response = client.delete(f"/api/v1/entries/{entry_id}", headers=other_headers)
    assert response.status_code == 404


def test_pagination(client, auth_headers):
    # Crear 5 entradas
    for i in range(5):
        client.post("/api/v1/entries/", json={
            "content": f"Entrada numero {i}."
        }, headers=auth_headers)

    # Pedir solo 2
    response = client.get("/api/v1/entries/?skip=0&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["entries"]) == 2
    assert data["total"] == 5