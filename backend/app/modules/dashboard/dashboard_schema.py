
from decimal import Decimal

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_products: int
    low_stock_products: int
    out_of_stock_products: int
    total_movements: int
    total_entries: Decimal
    total_exits: Decimal
    period_days: int
    period_movements: int
    period_entries: Decimal
    period_exits: Decimal
    period_balance: Decimal
    stock_turnover_rate: Decimal

    monthly_products: int
    weekly_low_stock_products: int
    weekly_out_of_stock_products: int
    monthly_movements: int


class DashboardMovementChartItem(BaseModel):
    date: str
    entries: Decimal
    exits: Decimal
