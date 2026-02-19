"""add telegram bot tables

Revision ID: 007_add_telegram_tables
Revises: 006_add_photo_datetime
Create Date: 2026-02-19 23:56:00
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "007_add_telegram_tables"
down_revision: Union[str, Sequence[str], None] = "006_add_photo_datetime"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Sales".telegram_sessions (
          id SERIAL PRIMARY KEY,
          telegram_user_id BIGINT NOT NULL UNIQUE,
          login TEXT NOT NULL REFERENCES "Sales".users(login) ON DELETE CASCADE,
          jwt_token TEXT NOT NULL,
          role TEXT NOT NULL,
          fio TEXT,
          last_activity_at TIMESTAMPTZ DEFAULT now(),
          created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_tg_sessions_user_id ON "Sales".telegram_sessions(telegram_user_id);
        CREATE INDEX IF NOT EXISTS idx_tg_sessions_login ON "Sales".telegram_sessions(login);

        CREATE TABLE IF NOT EXISTS "Sales".telegram_logs (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT now(),
          telegram_user_id BIGINT,
          login TEXT,
          role TEXT,
          action_type TEXT NOT NULL,
          detail TEXT,
          result TEXT,
          error_message TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_tg_logs_created_at ON "Sales".telegram_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_tg_logs_user_id ON "Sales".telegram_logs(telegram_user_id);
        CREATE INDEX IF NOT EXISTS idx_tg_logs_action ON "Sales".telegram_logs(action_type);

        CREATE TABLE IF NOT EXISTS "Sales".telegram_login_attempts (
          id SERIAL PRIMARY KEY,
          telegram_user_id BIGINT NOT NULL,
          attempted_at TIMESTAMPTZ DEFAULT now(),
          success BOOLEAN NOT NULL DEFAULT FALSE
        );
        CREATE INDEX IF NOT EXISTS idx_tg_login_attempts_user ON "Sales".telegram_login_attempts(telegram_user_id, attempted_at DESC);
        """
    )


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS "Sales".telegram_login_attempts CASCADE;')
    op.execute('DROP TABLE IF EXISTS "Sales".telegram_logs CASCADE;')
    op.execute('DROP TABLE IF EXISTS "Sales".telegram_sessions CASCADE;')

