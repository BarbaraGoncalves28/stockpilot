from datetime import datetime
from decimal import Decimal

from pydantic import (
    AliasPath,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class StockMovementCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(gt=0)
    movement_type: str
    quantity: Decimal = Field(
        ge=0,
        max_digits=12,
        decimal_places=3,
    )
    reason: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("movement_type")
    @classmethod
    def validate_movement_type(cls, value: str) -> str:
        value = value.strip().upper()

        if value not in {"IN", "OUT", "ADJUSTMENT"}:
            raise ValueError(
                "movement_type must be IN, OUT or ADJUSTMENT."
            )

        return value

    @model_validator(mode="after")
    def validate_quantity_for_movement(self):
        if self.movement_type in {"IN", "OUT"} and self.quantity <= 0:
            raise ValueError(
                "Quantity must be greater than zero for IN and OUT."
            )

        return self

    @field_validator("reason", "notes")
    @classmethod
    def normalize_optional_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str = Field(
        validation_alias=AliasPath("product", "name"),
    )
    product_sku: str = Field(
        validation_alias=AliasPath("product", "sku"),
    )
    user_id: int
    movement_type: str
    quantity: Decimal
    previous_stock: Decimal
    new_stock: Decimal
    reason: str | None
    notes: str | None
    created_at: datetime


class StockMovementListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[StockMovementResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
