import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.user import User


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


@event.listens_for(Session, "before_flush")
def assign_owner_to_legacy_test_records(session, flush_context, instances):
    """
    Compatibilidade para fixtures antigas:
    atribui o proprietário somente quando existe um único usuário.

    Não altera os modelos nem as regras de autorização da aplicação.
    """
    records = [
        obj
        for obj in session.new
        if isinstance(obj, (Category, Product, Supplier))
        and obj.owner_id is None
    ]

    if not records:
        return

    users = session.query(User.id).all()

    if len(users) == 1:
        owner_id = users[0][0]

        for record in records:
            record.owner_id = owner_id


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()