"""add user designation

Revision ID: e2a4c6d8f0b1
Revises: a4b5c6d7e8f9
Create Date: 2026-09-13
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e2a4c6d8f0b1"
down_revision = "a4b5c6d7e8f9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE public.users "
        "ADD COLUMN IF NOT EXISTS designation VARCHAR(100)"
    )


def downgrade() -> None:
    op.drop_column("users", "designation")
