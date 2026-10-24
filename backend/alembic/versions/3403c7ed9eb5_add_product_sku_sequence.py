"""add product sku sequence

Revision ID: 3403c7ed9eb5
Revises: 9ca6461baae2
"""
from typing import Sequence, Union

from alembic import op

revision: str = "3403c7ed9eb5"
down_revision: Union[str, Sequence[str], None] = "9ca6461baae2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE SEQUENCE product_sku_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1
    """)


def downgrade() -> None:
    op.execute("DROP SEQUENCE IF EXISTS product_sku_seq")
