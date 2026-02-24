"""Seed telegram internal dialog translations

Revision ID: 025_tg_dialog_i18n
Revises: 024_ensure_ru_text_integrity
Create Date: 2026-02-21 19:30:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "025_tg_dialog_i18n"
down_revision: Union[str, Sequence[str], None] = "024_ensure_ru_text_integrity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    [
        "telegram.button.back",
        "en",
        "Back",
        "telegram"
    ],
    [
        "telegram.button.back",
        "ru",
        "\u041d\u0430\u0437\u0430\u0434",
        "telegram"
    ],
    [
        "telegram.button.back",
        "uz",
        "Orqaga",
        "telegram"
    ],
    [
        "telegram.button.cancel",
        "en",
        "Cancel",
        "telegram"
    ],
    [
        "telegram.button.cancel",
        "ru",
        "\u041e\u0442\u043c\u0435\u043d\u0430",
        "telegram"
    ],
    [
        "telegram.button.cancel",
        "uz",
        "Bekor qilish",
        "telegram"
    ],
    [
        "telegram.button.skip",
        "en",
        "Skip",
        "telegram"
    ],
    [
        "telegram.button.skip",
        "ru",
        "\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c",
        "telegram"
    ],
    [
        "telegram.button.skip",
        "uz",
        "Otkazib yuborish",
        "telegram"
    ],
    [
        "telegram.button.skip_comment",
        "en",
        "Skip comment",
        "telegram"
    ],
    [
        "telegram.button.skip_comment",
        "ru",
        "\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
        "telegram"
    ],
    [
        "telegram.button.skip_comment",
        "uz",
        "Izohni otkazib yuborish",
        "telegram"
    ],
    [
        "telegram.button.skip_time",
        "en",
        "Skip time",
        "telegram"
    ],
    [
        "telegram.button.skip_time",
        "ru",
        "\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u0432\u0440\u0435\u043c\u044f",
        "telegram"
    ],
    [
        "telegram.button.skip_time",
        "uz",
        "Vaqtni otkazib yuborish",
        "telegram"
    ],
    [
        "telegram.visit_create.all_correct",
        "en",
        "Is everything correct?",
        "telegram"
    ],
    [
        "telegram.visit_create.all_correct",
        "ru",
        "\u0412\u0441\u0451 \u0432\u0435\u0440\u043d\u043e?",
        "telegram"
    ],
    [
        "telegram.visit_create.all_correct",
        "uz",
        "Hammasi togri?",
        "telegram"
    ],
    [
        "telegram.visit_create.cancelled",
        "en",
        "Visit creation canceled.\n\nPress /start to return to main menu.",
        "telegram"
    ],
    [
        "telegram.visit_create.cancelled",
        "ru",
        "\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0432\u0438\u0437\u0438\u0442\u0430 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u043e.\n\n\u041d\u0430\u0436\u043c\u0438\u0442\u0435 /start \u0434\u043b\u044f \u0432\u043e\u0437\u0432\u0440\u0430\u0442\u0430 \u0432 \u0433\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e.",
        "telegram"
    ],
    [
        "telegram.visit_create.cancelled",
        "uz",
        "Tashrif yaratish bekor qilindi.\n\nAsosiy menyuga qaytish uchun /start ni bosing.",
        "telegram"
    ],
    [
        "telegram.visit_create.change_search",
        "en",
        "Change search",
        "telegram"
    ],
    [
        "telegram.visit_create.change_search",
        "ru",
        "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043e\u0438\u0441\u043a",
        "telegram"
    ],
    [
        "telegram.visit_create.change_search",
        "uz",
        "Qidiruvni ozgartirish",
        "telegram"
    ],
    [
        "telegram.visit_create.check_data",
        "en",
        "Check data:",
        "telegram"
    ],
    [
        "telegram.visit_create.check_data",
        "ru",
        "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435:",
        "telegram"
    ],
    [
        "telegram.visit_create.check_data",
        "uz",
        "Malumotlarni tekshiring:",
        "telegram"
    ],
    [
        "telegram.visit_create.create_visit_btn",
        "en",
        "Create visit",
        "telegram"
    ],
    [
        "telegram.visit_create.create_visit_btn",
        "ru",
        "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0432\u0438\u0437\u0438\u0442",
        "telegram"
    ],
    [
        "telegram.visit_create.create_visit_btn",
        "uz",
        "Tashrif yaratish",
        "telegram"
    ],
    [
        "telegram.visit_create.error_date_format",
        "en",
        "Error: invalid date format.\n\nEnter date in DD.MM.YYYY or DD.MM format. Example: 25.12.2026 or 25.12",
        "telegram"
    ],
    [
        "telegram.visit_create.error_date_format",
        "ru",
        "\u041e\u0448\u0438\u0431\u043a\u0430: \u043d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0444\u043e\u0440\u043c\u0430\u0442 \u0434\u0430\u0442\u044b.\n\n\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0432 \u0444\u043e\u0440\u043c\u0430\u0442\u0435 \u0414\u0414.\u041c\u041c.\u0413\u0413\u0413\u0413 \u0438\u043b\u0438 \u0414\u0414.\u041c\u041c: \u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: 25.12.2026 \u0438\u043b\u0438 25.12",
        "telegram"
    ],
    [
        "telegram.visit_create.error_date_format",
        "uz",
        "Xato: sana formati notogri.\n\nSanani KK.OO.YYYY yoki KK.OO formatida kiriting. Masalan: 25.12.2026 yoki 25.12",
        "telegram"
    ],
    [
        "telegram.visit_create.error_min_search",
        "en",
        "Error: enter at least 2 characters for search.\n\nTry again:",
        "telegram"
    ],
    [
        "telegram.visit_create.error_min_search",
        "ru",
        "\u041e\u0448\u0438\u0431\u043a\u0430: \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043c\u0438\u043d\u0438\u043c\u0443\u043c 2 \u0441\u0438\u043c\u0432\u043e\u043b\u0430 \u0434\u043b\u044f \u043f\u043e\u0438\u0441\u043a\u0430.\n\n\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437:",
        "telegram"
    ],
    [
        "telegram.visit_create.error_min_search",
        "uz",
        "Xato: qidiruv uchun kamida 2 ta belgi kiriting.\n\nQayta urinib koring:",
        "telegram"
    ],
    [
        "telegram.visit_create.error_time_format",
        "en",
        "Error: invalid time format.\n\nEnter time in HH:MM format. Example: 14:30",
        "telegram"
    ],
    [
        "telegram.visit_create.error_time_format",
        "ru",
        "\u041e\u0448\u0438\u0431\u043a\u0430: \u043d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0444\u043e\u0440\u043c\u0430\u0442 \u0432\u0440\u0435\u043c\u0435\u043d\u0438.\n\n\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u0440\u0435\u043c\u044f \u0432 \u0444\u043e\u0440\u043c\u0430\u0442\u0435 \u0427\u0427:\u041c\u041c. \u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: 14:30",
        "telegram"
    ],
    [
        "telegram.visit_create.error_time_format",
        "uz",
        "Xato: vaqt formati notogri.\n\nVaqtni SS:DD formatida kiriting. Masalan: 14:30",
        "telegram"
    ],
    [
        "telegram.visit_create.found_customers",
        "en",
        "Customers found:",
        "telegram"
    ],
    [
        "telegram.visit_create.found_customers",
        "ru",
        "\u041d\u0430\u0439\u0434\u0435\u043d\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432:",
        "telegram"
    ],
    [
        "telegram.visit_create.found_customers",
        "uz",
        "Topilgan mijozlar:",
        "telegram"
    ],
    [
        "telegram.visit_create.required_field",
        "en",
        "Required field",
        "telegram"
    ],
    [
        "telegram.visit_create.required_field",
        "ru",
        "\u041e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u043f\u043e\u043b\u0435",
        "telegram"
    ],
    [
        "telegram.visit_create.required_field",
        "uz",
        "Majburiy maydon",
        "telegram"
    ],
    [
        "telegram.visit_create.select_customer",
        "en",
        "Select customer:",
        "telegram"
    ],
    [
        "telegram.visit_create.select_customer",
        "ru",
        "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430:",
        "telegram"
    ],
    [
        "telegram.visit_create.select_customer",
        "uz",
        "Mijozni tanlang:",
        "telegram"
    ],
    [
        "telegram.visit_create.status_cancelled",
        "en",
        "Canceled",
        "telegram"
    ],
    [
        "telegram.visit_create.status_cancelled",
        "ru",
        "\u041e\u0442\u043c\u0435\u043d\u0451\u043d",
        "telegram"
    ],
    [
        "telegram.visit_create.status_cancelled",
        "uz",
        "Bekor qilingan",
        "telegram"
    ],
    [
        "telegram.visit_create.status_completed",
        "en",
        "Completed",
        "telegram"
    ],
    [
        "telegram.visit_create.status_completed",
        "ru",
        "\u0412\u044b\u043f\u043e\u043b\u043d\u0435\u043d",
        "telegram"
    ],
    [
        "telegram.visit_create.status_completed",
        "uz",
        "Bajarilgan",
        "telegram"
    ],
    [
        "telegram.visit_create.status_planned",
        "en",
        "Planned",
        "telegram"
    ],
    [
        "telegram.visit_create.status_planned",
        "ru",
        "\u0417\u0430\u043f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d",
        "telegram"
    ],
    [
        "telegram.visit_create.status_planned",
        "uz",
        "Rejalashtirilgan",
        "telegram"
    ],
    [
        "telegram.visit_create.status_postponed",
        "en",
        "Postponed",
        "telegram"
    ],
    [
        "telegram.visit_create.status_postponed",
        "ru",
        "\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0451\u043d",
        "telegram"
    ],
    [
        "telegram.visit_create.status_postponed",
        "uz",
        "Kochirildi",
        "telegram"
    ],
    [
        "telegram.visit_create.step1",
        "en",
        "Step 1/5: enter customer name or TIN for search:",
        "telegram"
    ],
    [
        "telegram.visit_create.step1",
        "ru",
        "\u0428\u0430\u0433 1 \u0438\u0437 5: \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 \u0438\u043b\u0438 \u0418\u041d\u041d \u0434\u043b\u044f \u043f\u043e\u0438\u0441\u043a\u0430:",
        "telegram"
    ],
    [
        "telegram.visit_create.step1",
        "uz",
        "1/5: qidirish uchun mijoz nomi yoki STIR kiriting:",
        "telegram"
    ],
    [
        "telegram.visit_create.step2",
        "en",
        "Step 2/5: enter visit date (DD.MM.YYYY or DD.MM):",
        "telegram"
    ],
    [
        "telegram.visit_create.step2",
        "ru",
        "\u0428\u0430\u0433 2 \u0438\u0437 5: \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0434\u0430\u0442\u0443 \u0432\u0438\u0437\u0438\u0442\u0430 (\u0414\u0414.\u041c\u041c.\u0413\u0413\u0413\u0413 \u0438\u043b\u0438 \u0414\u0414.\u041c\u041c):",
        "telegram"
    ],
    [
        "telegram.visit_create.step2",
        "uz",
        "2/5: tashrif sanasini kiriting (KK.OO.YYYY yoki KK.OO):",
        "telegram"
    ],
    [
        "telegram.visit_create.step3",
        "en",
        "Step 3/5: enter visit time (HH:MM) or press Skip:",
        "telegram"
    ],
    [
        "telegram.visit_create.step3",
        "ru",
        "\u0428\u0430\u0433 3 \u0438\u0437 5: \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u0440\u0435\u043c\u044f \u0432\u0438\u0437\u0438\u0442\u0430 (\u0427\u0427:\u041c\u041c) \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c:",
        "telegram"
    ],
    [
        "telegram.visit_create.step3",
        "uz",
        "3/5: tashrif vaqtini kiriting (SS:DD) yoki Skip tugmasini bosing:",
        "telegram"
    ],
    [
        "telegram.visit_create.step4",
        "en",
        "Step 4/5: select visit status:",
        "telegram"
    ],
    [
        "telegram.visit_create.step4",
        "ru",
        "\u0428\u0430\u0433 4 \u0438\u0437 5: \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441 \u0432\u0438\u0437\u0438\u0442\u0430:",
        "telegram"
    ],
    [
        "telegram.visit_create.step4",
        "uz",
        "4/5: tashrif holatini tanlang:",
        "telegram"
    ],
    [
        "telegram.visit_create.step5",
        "en",
        "Step 5/5: enter comment or press Skip:",
        "telegram"
    ],
    [
        "telegram.visit_create.step5",
        "ru",
        "\u0428\u0430\u0433 5 \u0438\u0437 5: \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c:",
        "telegram"
    ],
    [
        "telegram.visit_create.step5",
        "uz",
        "5/5: izoh kiriting yoki Skip tugmasini bosing:",
        "telegram"
    ],
    [
        "telegram.visit_create.title",
        "en",
        "Create visit",
        "telegram"
    ],
    [
        "telegram.visit_create.title",
        "ru",
        "\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0432\u0438\u0437\u0438\u0442\u0430",
        "telegram"
    ],
    [
        "telegram.visit_create.title",
        "uz",
        "Tashrif yaratish",
        "telegram"
    ]
]


def upgrade() -> None:
    conn = op.get_bind()
    for key, lang, text, category in ROWS:
        conn.execute(
            sa.text(
                """
                INSERT INTO "Sales".translations
                    (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
                VALUES
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_025', 'migration_025', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_025',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass
