"""preserve task designation fields

Revision ID: b7c3d8e1f9a2
Revises: f3b5d7e9a1c2
Create Date: 2026-09-18
"""

from alembic import op


revision = "b7c3d8e1f9a2"
down_revision = "f3b5d7e9a1c2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS keeps this migration safe for the already-provisioned
    # database, where a missing historical migration created these fields.
    op.execute(
        "ALTER TABLE public.tasks "
        "ADD COLUMN IF NOT EXISTS required_designation VARCHAR(100)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_tasks_required_designation "
        "ON public.tasks (required_designation)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_users_designation "
        "ON public.users (designation)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_users_designation")
    op.execute("DROP INDEX IF EXISTS ix_tasks_required_designation")
    op.execute("ALTER TABLE public.tasks DROP COLUMN IF EXISTS required_designation")
