
"""Add inventory ownership to categories, suppliers and products."""

from alembic import op
import sqlalchemy as sa


revision = "a91f4c7d2e60"
down_revision = "edf2b055cf7d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()

    owner_id = connection.execute(
        sa.text(
            "SELECT id FROM users "
            "WHERE lower(email) = lower(:email)"
        ),
        {"email": "barbara@gmail.com"},
    ).scalar_one_or_none()

    if owner_id is None:
        raise RuntimeError(
            "Migration cancelled: barbara@gmail.com was not found. "
            "No inventory ownership changes were applied."
        )

    for table in ("categories", "suppliers", "products"):
        op.add_column(
            table,
            sa.Column("owner_id", sa.Integer(), nullable=True),
        )

        connection.execute(
            sa.text(
                f"UPDATE {table} SET owner_id = :owner_id "
                "WHERE owner_id IS NULL"
            ),
            {"owner_id": owner_id},
        )

        op.create_foreign_key(
            f"fk_{table}_owner_id_users",
            table,
            "users",
            ["owner_id"],
            ["id"],
        )

        op.alter_column(
            table,
            "owner_id",
            existing_type=sa.Integer(),
            nullable=False,
        )

        op.create_index(
            f"ix_{table}_owner_id",
            table,
            ["owner_id"],
        )

    # O SKU deve ser único dentro de cada conta, não globalmente.
    op.execute("DROP INDEX IF EXISTS ix_products_sku")

    op.create_index(
        "uq_products_owner_sku",
        "products",
        ["owner_id", "sku"],
        unique=True,
    )

    # O nome da categoria deve ser único, sem diferenciar maiúsculas,
    # dentro de cada conta.
    op.execute("DROP INDEX IF EXISTS ix_categories_name")

    op.execute(
        "CREATE UNIQUE INDEX uq_categories_owner_name_lower "
        "ON categories (owner_id, lower(name))"
    )


def downgrade() -> None:
    op.execute(
        "DROP INDEX IF EXISTS uq_categories_owner_name_lower"
    )

    op.drop_index(
        "uq_products_owner_sku",
        table_name="products",
    )

    for table in ("products", "suppliers", "categories"):
        op.drop_index(
            f"ix_{table}_owner_id",
            table_name=table,
        )

        op.drop_constraint(
            f"fk_{table}_owner_id_users",
            table,
            type_="foreignkey",
        )

        op.drop_column(table, "owner_id")

    op.create_index(
        "ix_products_sku",
        "products",
        ["sku"],
        unique=True,
    )

    op.create_index(
        "ix_categories_name",
        "categories",
        ["name"],
        unique=True,
    )
