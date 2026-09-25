from app.db.database import get_db
from app.modules.auth.auth_dependencies import get_current_user
from app.modules.dashboard.dashboard_schema import (
    DashboardMovementChartItem,
    DashboardSummaryResponse,
)
from app.modules.dashboard.dashboard_service import (
    get_dashboard_movement_chart,
    get_dashboard_summary,
)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def summary(
    days: int = Query(
        default=30,
        ge=1,
        le=365,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_dashboard_summary(
        db,
        days,
    )


@router.get(
    "/movements",
    response_model=list[DashboardMovementChartItem],
)
def movements(
    days: int = Query(
        default=30,
        ge=1,
        le=365,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_dashboard_movement_chart(
        db,
        days,
    )


