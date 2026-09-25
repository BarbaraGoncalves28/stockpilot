from datetime import UTC, datetime, timedelta, timezone

from app.core.config import REFRESH_TOKEN_EXPIRE_DAYS
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.session import Session
from app.models.user import User
from app.modules.auth.auth_schema import (
    LoginRequest,
    RegisterRequest,
)
from sqlalchemy import select
from sqlalchemy.orm import Session as DatabaseSession


def register_user(
    db: DatabaseSession,
    data: RegisterRequest,
) -> User:
    email = data.email.lower().strip()

    existing_user = db.scalar(
        select(User).where(
            User.email == email,
        )
    )

    if existing_user:
        raise ValueError(
            "User with this email already exists."
        )

    user = User(
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(
            data.password
        ),
        role="USER",
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(
    db: DatabaseSession,
    data: LoginRequest,
) -> tuple[str, str, User]:
    email = data.email.lower().strip()

    user = db.scalar(
        select(User).where(
            User.email == email,
        )
    )

    if not user:
        raise ValueError(
            "Invalid email or password."
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise ValueError(
            "Invalid email or password."
        )

    if not user.is_active:
        raise ValueError(
            "User account is inactive."
        )

    access_token = create_access_token(
        user.id
    )

    refresh_token = create_refresh_token()

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    user_session = Session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=expires_at.replace(
            tzinfo=None
        ),
    )

    db.add(user_session)
    db.commit()

    return (
        access_token,
        refresh_token,
        user,
    )


def refresh_access_token(
    db: DatabaseSession,
    refresh_token: str,
) -> str:
    user_session = db.scalar(
        select(Session).where(
            Session.refresh_token
            == refresh_token,
        )
    )

    if not user_session:
        raise ValueError(
            "Invalid refresh token."
        )

    if user_session.revoked_at is not None:
        raise ValueError(
            "Refresh token has been revoked."
        )

    now = datetime.now(UTC).replace(tzinfo=None)

    if user_session.expires_at <= now:
        raise ValueError(
            "Refresh token has expired."
        )

    user = db.get(
        User,
        user_session.user_id,
    )

    if not user:
        raise ValueError(
            "User not found."
        )

    if not user.is_active:
        raise ValueError(
            "User account is inactive."
        )

    return create_access_token(
        user.id
    )


def logout_user(
    db: DatabaseSession,
    refresh_token: str,
) -> None:
    user_session = db.scalar(
        select(Session).where(
            Session.refresh_token
            == refresh_token,
        )
    )

    if not user_session:
        raise ValueError(
            "Invalid refresh token."
        )

    if user_session.revoked_at is not None:
        raise ValueError(
            "Refresh token has already been revoked."
        )

    user_session.revoked_at = datetime.now(
        UTC
    ).replace(tzinfo=None)

    db.commit()


def list_users(
    db: DatabaseSession,
) -> list[User]:
    statement = select(User).order_by(
        User.created_at.desc()
    )

    return list(
        db.scalars(statement).all()
    )