from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StockMovementCreate(BaseModel):
    product_id: int = Field(gt=0)
    movement_type: str
    quantity: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=3,
    )
    reason: str | None = Field(
        default=None,
        max_length=255,
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
    )

    @field_validator("movement_type")
    @classmethod
    def validate_movement_type(cls, value: str) -> str:
        value = value.strip().upper()

        allowed_types = {
            "IN",
            "OUT",
            "ADJUSTMENT",
        }

        if value not in allowed_types:
            raise ValueError(
                "movement_type must be IN, OUT or ADJUSTMENT."
            )

        return value


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    user_id: int
    movement_type: str
    quantity: Decimal
    previous_stock: Decimal
    new_stock: Decimal
    reason: str | None
    notes: str | None
    created_at: datetime


class StockMovementListResponse(BaseModel):
    items: list[StockMovementResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


