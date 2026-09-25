from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.user import User


EMAIL = "barbara@gmail.com"


def main() -> None:
    db = SessionLocal()

    try:
        user = db.scalar(
            select(User).where(User.email == EMAIL)
        )

        if not user:
            print(f"Usuário não encontrado: {EMAIL}")
            return

        if user.role == "ADMIN":
            print(f"{user.email} já é ADMIN.")
            return

        user.role = "ADMIN"

        db.commit()
        db.refresh(user)

        print(
            f"Usuário {user.email} promovido para ADMIN com sucesso."
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()