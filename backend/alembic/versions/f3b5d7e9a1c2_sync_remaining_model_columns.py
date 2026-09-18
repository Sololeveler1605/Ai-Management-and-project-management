"""sync remaining model columns

Revision ID: f3b5d7e9a1c2
Revises: e2a4c6d8f0b1
Create Date: 2026-09-13
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f3b5d7e9a1c2"
down_revision = "e2a4c6d8f0b1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE public.tasks "
        "ADD COLUMN IF NOT EXISTS progress_percent INTEGER NOT NULL DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE public.project_modules "
        "ALTER COLUMN icon TYPE VARCHAR(32)"
    )
    op.execute(
        "ALTER TABLE public.project_modules "
        "ALTER COLUMN status TYPE VARCHAR(32)"
    )
    op.execute(
        "ALTER TABLE public.project_modules "
        "ALTER COLUMN created_at SET NOT NULL"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_project_modules_organization_id "
        "ON public.project_modules (organization_id)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_project_modules_organization_id")
    op.execute(
        "ALTER TABLE public.project_modules "
        "ALTER COLUMN created_at DROP NOT NULL"
    )
    op.execute(
        "ALTER TABLE public.project_modules "
        "ALTER COLUMN status TYPE VARCHAR(50)"
    )
    op.execute(
        "ALTER TABLE public.project_modules "
        "ALTER COLUMN icon TYPE VARCHAR(10)"
    )
    op.drop_column("tasks", "progress_percent")
