"""add task start date

Revision ID: f2a1c7d8e9b0
Revises: c9d2f4a6b8e1
Create Date: 2026-08-14
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f2a1c7d8e9b0"
down_revision = "c9d2f4a6b8e1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("start_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "start_date")
