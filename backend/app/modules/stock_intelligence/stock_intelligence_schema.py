from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class StockIntelligenceItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    current_stock: Decimal
    min_stock: Decimal
    average_daily_consumption: Decimal
    estimated_days_until_min_stock: Decimal | None
    risk_level: str


class StockAlertItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    current_stock: Decimal
    min_stock: Decimal
    average_daily_consumption: Decimal
    estimated_days_until_min_stock: Decimal | None
    risk_level: str
    message: str
    last_movement_at: datetime | None