"""store assistant answers for question events

Revision ID: 20260614_0005
Revises: 20260611_0004
Create Date: 2026-06-14
"""

from alembic import op

revision = "20260614_0005"
down_revision = "20260611_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE question_events
        ADD COLUMN IF NOT EXISTS assistant_answer text
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE question_events DROP COLUMN IF EXISTS assistant_answer")
