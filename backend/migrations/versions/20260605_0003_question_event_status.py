"""add question event outcome fields

Revision ID: 20260605_0003
Revises: 20260605_0002
Create Date: 2026-06-05
"""

from alembic import op

revision = "20260605_0003"
down_revision = "20260605_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE question_events
        ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted'
        """
    )
    op.execute(
        """
        ALTER TABLE question_events
        ADD COLUMN IF NOT EXISTS rejection_reason text
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_question_events_ip_created_at
        ON question_events (ip_address, created_at DESC)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_question_events_ip_created_at")
    op.execute("ALTER TABLE question_events DROP COLUMN IF EXISTS rejection_reason")
    op.execute("ALTER TABLE question_events DROP COLUMN IF EXISTS status")
