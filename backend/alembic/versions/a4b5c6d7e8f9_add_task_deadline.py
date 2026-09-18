"""add task deadline

Revision ID: a4b5c6d7e8f9
Revises: f2a1c7d8e9b0
Create Date: 2026-08-14
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a4b5c6d7e8f9"
down_revision = "f2a1c7d8e9b0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("deadline", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "deadline")
