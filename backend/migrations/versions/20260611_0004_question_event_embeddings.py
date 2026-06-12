"""add semantic embeddings for question events

Revision ID: 20260611_0004
Revises: 20260605_0003
Create Date: 2026-06-11
"""

from alembic import op

revision = "20260611_0004"
down_revision = "20260605_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute(
        """
        ALTER TABLE question_events
        ADD COLUMN IF NOT EXISTS question_embedding vector(1536)
        """
    )
    op.execute(
        """
        ALTER TABLE question_events
        ADD COLUMN IF NOT EXISTS embedding_model text
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_question_events_embedding_model
        ON question_events (embedding_model)
        WHERE question_embedding IS NOT NULL
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_question_events_embedding_model")
    op.execute("ALTER TABLE question_events DROP COLUMN IF EXISTS embedding_model")
    op.execute("ALTER TABLE question_events DROP COLUMN IF EXISTS question_embedding")
