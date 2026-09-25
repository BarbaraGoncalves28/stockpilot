from app.db.database import get_db
from app.models.user import User
from app.modules.auth.auth_dependencies import (
    get_current_user,
)
from app.modules.auth.auth_schema import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
    UserResponse,
)
from app.modules.auth.auth_service import (
    list_users,
    login_user,
    logout_user,
    refresh_access_token,
    register_user,
)
from app.modules.auth.role_dependencies import (
    require_admin,
)
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return register_user(
            db,
            data,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        (
            access_token,
            refresh_token,
            user,
        ) = login_user(
            db,
            data,
        )

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error


@router.post(
    "/refresh",
)
def refresh(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        access_token = refresh_access_token(
            db,
            data.refresh_token,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
def logout(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        logout_user(
            db,
            data.refresh_token,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error


@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user=Depends(
        get_current_user
    ),
):
    return current_user

@router.get(
    "/users",
    response_model=list[UserResponse],
)
def users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return list_users(db)


