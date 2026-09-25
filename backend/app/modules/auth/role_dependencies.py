from app.models.user import User
from app.modules.auth.auth_dependencies import get_current_user
from fastapi import Depends, HTTPException, status


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


