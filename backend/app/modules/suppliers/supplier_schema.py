from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SupplierCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )
    email: str | None = Field(
        default=None,
        max_length=255,
    )
    phone: str | None = Field(
        default=None,
        max_length=30,
    )
    document: str | None = Field(
        default=None,
        max_length=30,
    )
    address: str | None = Field(
        default=None,
        max_length=255,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Supplier name cannot be empty.")

        return value


class SupplierUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    email: str | None = Field(
        default=None,
        max_length=255,
    )
    phone: str | None = Field(
        default=None,
        max_length=30,
    )
    document: str | None = Field(
        default=None,
        max_length=30,
    )
    address: str | None = Field(
        default=None,
        max_length=255,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Supplier name cannot be empty.")

        return value


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str | None
    phone: str | None
    document: str | None
    address: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class SupplierListResponse(BaseModel):
    items: list[SupplierResponse]
    page: int
    page_size: int
    total: int
    total_pages: int