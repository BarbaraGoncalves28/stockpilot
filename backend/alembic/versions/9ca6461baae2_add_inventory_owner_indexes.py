"""Add indexes for inventory ownership."""

from alembic import op

revision = "9ca6461baae2"
down_revision = "a91f4c7d2e60"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_categories_owner_id "
        "ON categories (owner_id)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_suppliers_owner_id "
        "ON suppliers (owner_id)"
    )

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_products_owner_id "
        "ON products (owner_id)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_products_owner_id")
    op.execute("DROP INDEX IF EXISTS ix_suppliers_owner_id")
    op.execute("DROP INDEX IF EXISTS ix_categories_owner_id")