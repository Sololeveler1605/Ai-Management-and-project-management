"""link tasks to project workflow modules

Revision ID: d6b69e2b1a7f
Revises: 1a5dffe289f6
Create Date: 2026-08-12
"""

from alembic import op
import sqlalchemy as sa


revision = "d6b69e2b1a7f"
down_revision = "1a5dffe289f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("module_id", sa.UUID(), nullable=True))
    op.create_index(op.f("ix_tasks_module_id"), "tasks", ["module_id"], unique=False)
    op.create_foreign_key(
        "fk_tasks_module_id", "tasks", "project_modules", ["module_id"], ["id"]
    )


def downgrade() -> None:
    op.drop_constraint("fk_tasks_module_id", "tasks", type_="foreignkey")
    op.drop_index(op.f("ix_tasks_module_id"), table_name="tasks")
    op.drop_column("tasks", "module_id")
