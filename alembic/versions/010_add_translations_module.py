"""add translations module

Revision ID: 010_add_translations_module
Revises: 009_add_performance_indexes
Create Date: 2026-02-20 23:10:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "010_add_translations_module"
down_revision: Union[str, Sequence[str], None] = "009_add_performance_indexes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Sales".translation_categories (
          id UUID PRIMARY KEY,
          code VARCHAR(100) NOT NULL UNIQUE,
          name_ru VARCHAR(255) NOT NULL,
          name_uz VARCHAR(255) NOT NULL,
          name_en VARCHAR(255) NOT NULL,
          description TEXT,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Sales".translations (
          id UUID PRIMARY KEY,
          translation_key VARCHAR(255) NOT NULL,
          language_code VARCHAR(5) NOT NULL,
          translation_text TEXT NOT NULL,
          category VARCHAR(100),
          notes TEXT,
          created_by VARCHAR(100),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_by VARCHAR(100),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_translations_key_lang UNIQUE (translation_key, language_code),
          CONSTRAINT chk_translations_lang CHECK (language_code IN ('ru', 'uz', 'en')),
          CONSTRAINT fk_translations_category
            FOREIGN KEY (category)
            REFERENCES "Sales".translation_categories(code)
            ON UPDATE CASCADE
            ON DELETE SET NULL
        )
        """
    )
    op.execute('CREATE INDEX IF NOT EXISTS idx_translations_key ON "Sales".translations (translation_key)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_translations_language ON "Sales".translations (language_code)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_translations_category ON "Sales".translations (category)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_translations_updated_at ON "Sales".translations (updated_at DESC)')
    op.execute(
        """
        CREATE OR REPLACE FUNCTION "Sales".set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
        """
    )
    op.execute('DROP TRIGGER IF EXISTS trg_translation_categories_updated_at ON "Sales".translation_categories')
    op.execute(
        """
        CREATE TRIGGER trg_translation_categories_updated_at
        BEFORE UPDATE ON "Sales".translation_categories
        FOR EACH ROW EXECUTE FUNCTION "Sales".set_updated_at()
        """
    )
    op.execute('DROP TRIGGER IF EXISTS trg_translations_updated_at ON "Sales".translations')
    op.execute(
        """
        CREATE TRIGGER trg_translations_updated_at
        BEFORE UPDATE ON "Sales".translations
        FOR EACH ROW EXECUTE FUNCTION "Sales".set_updated_at()
        """
    )

    op.execute(
        """
        INSERT INTO "Sales".translation_categories
          (id, code, name_ru, name_uz, name_en, description, active)
        VALUES
          (md5(random()::text || clock_timestamp()::text)::uuid, 'operation_types', 'Типы операций', 'Operatsiya turlari', 'Operation Types', 'Operation types dictionary', TRUE),
          (md5(random()::text || clock_timestamp()::text)::uuid, 'statuses', 'Статусы', 'Holatlar', 'Statuses', 'Statuses dictionary', TRUE),
          (md5(random()::text || clock_timestamp()::text)::uuid, 'payment_types', 'Типы платежей', 'To''lov turlari', 'Payment Types', 'Payment types dictionary', TRUE),
          (md5(random()::text || clock_timestamp()::text)::uuid, 'menu', 'Пункты меню', 'Menyu elementlari', 'Menu Items', 'Sidebar and menu items', TRUE),
          (md5(random()::text || clock_timestamp()::text)::uuid, 'fields', 'Названия полей', 'Maydon nomlari', 'Field Names', 'Field labels', TRUE),
          (md5(random()::text || clock_timestamp()::text)::uuid, 'buttons', 'Кнопки', 'Tugmalar', 'Buttons', 'Button labels', TRUE),
          (md5(random()::text || clock_timestamp()::text)::uuid, 'messages', 'Сообщения', 'Xabarlar', 'Messages', 'System messages and alerts', TRUE)
        ON CONFLICT (code) DO UPDATE SET
          name_ru = EXCLUDED.name_ru,
          name_uz = EXCLUDED.name_uz,
          name_en = EXCLUDED.name_en,
          description = EXCLUDED.description,
          active = EXCLUDED.active;
        """
    )

    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          'operation_type.' || ot.code,
          'ru',
          ot.name,
          'operation_types',
          'migration_010'
        FROM "Sales".operation_types ot
        ON CONFLICT (translation_key, language_code) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          'status.' || s.code,
          'ru',
          s.name,
          'statuses',
          'migration_010'
        FROM "Sales".status s
        ON CONFLICT (translation_key, language_code) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          'payment_type.' || p.code,
          'ru',
          p.name,
          'payment_types',
          'migration_010'
        FROM "Sales".payment_type p
        ON CONFLICT (translation_key, language_code) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          'menu.' || m.code,
          'ru',
          m.label,
          'menu',
          'migration_010'
        FROM "Sales".menu_items m
        ON CONFLICT (translation_key, language_code) DO NOTHING
        """
    )


def downgrade() -> None:
    op.execute('DROP TRIGGER IF EXISTS trg_translations_updated_at ON "Sales".translations')
    op.execute('DROP TRIGGER IF EXISTS trg_translation_categories_updated_at ON "Sales".translation_categories')
    op.execute('DROP TABLE IF EXISTS "Sales".translations CASCADE')
    op.execute('DROP TABLE IF EXISTS "Sales".translation_categories CASCADE')
