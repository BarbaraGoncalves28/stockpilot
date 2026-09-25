from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default=None)
    category_id: int = Field(gt=0)
    supplier_id: int | None = Field(default=None, gt=0)
    cost_price: Decimal = Field(
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    sale_price: Decimal = Field(
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    min_stock: Decimal = Field(
        default=0,
        ge=0,
        max_digits=12,
        decimal_places=3,
    )
    max_stock: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=3,
    )
    unit: str = Field(
        default="UN",
        min_length=1,
        max_length=20,
    )

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("unit")
    @classmethod
    def normalize_unit(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("max_stock")
    @classmethod
    def validate_max_stock(
        cls,
        value: Decimal | None,
        info,
    ) -> Decimal | None:
        if value is None:
            return None

        min_stock = info.data.get("min_stock")

        if min_stock is not None and value < min_stock:
            raise ValueError(
                "max_stock must be greater than or equal to min_stock."
            )

        return value


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    sku: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    description: str | None = Field(default=None)
    category_id: int | None = Field(default=None, gt=0)
    supplier_id: int | None = Field(default=None, gt=0)
    cost_price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    sale_price: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    min_stock: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=3,
    )
    max_stock: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=3,
    )
    unit: str | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )

    @field_validator("sku")
    @classmethod
    def normalize_sku(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        return value.strip().upper()

    @field_validator("unit")
    @classmethod
    def normalize_unit(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        return value.strip().upper()


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    description: str | None
    category_id: int
    supplier_id: int | None
    cost_price: Decimal
    sale_price: Decimal
    current_stock: Decimal
    min_stock: Decimal
    max_stock: Decimal | None
    unit: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


