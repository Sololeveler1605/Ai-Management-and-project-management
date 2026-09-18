"""track when tasks are completed

Revision ID: e7c80f3c2b8a
Revises: d6b69e2b1a7f
Create Date: 2026-08-12
"""

from alembic import op
import sqlalchemy as sa


revision = "e7c80f3c2b8a"
down_revision = "d6b69e2b1a7f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("completed_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "completed_at")
