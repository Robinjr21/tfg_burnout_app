import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

# Base de datos en memoria para tests
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Sobreescribir la dependencia de BD con la de test
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Crea las tablas antes de cada test y las elimina después."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def registered_user(client):
    """Crea un usuario de prueba y devuelve sus credenciales."""
    client.post("/api/v1/auth/register", json={
        "email": "test@test.com",
        "password": "password123"
    })
    return {"email": "test@test.com", "password": "password123"}


@pytest.fixture
def auth_headers(client, registered_user):
    """Devuelve headers con token JWT válido."""
    response = client.post("/api/v1/auth/login", json=registered_user)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}