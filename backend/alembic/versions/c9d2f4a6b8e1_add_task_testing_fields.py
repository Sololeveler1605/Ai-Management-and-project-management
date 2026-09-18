"""add task testing assignment fields

Revision ID: c9d2f4a6b8e1
Revises: e7c80f3c2b8a
Create Date: 2026-08-13
"""

from alembic import op
import sqlalchemy as sa


revision = "c9d2f4a6b8e1"
down_revision = "e7c80f3c2b8a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("testing_assigned_to", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.add_column("tasks", sa.Column("testing_status", sa.String(length=20), nullable=True))
    op.alter_column("tasks", "testing_assigned_to", server_default=None)


def downgrade() -> None:
    op.drop_column("tasks", "testing_status")
    op.drop_column("tasks", "testing_assigned_to")
