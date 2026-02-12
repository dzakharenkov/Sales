-- Миграция: добавление даты и времени съёмки к таблице customer_photo
-- ОБЯЗАТЕЛЬНО выполнить на сервере! Иначе: column photo_datetime does not exist
-- psql -h HOST -U USER -d DB -f migrations/add_photo_datetime.sql

ALTER TABLE "Sales".customer_photo ADD COLUMN IF NOT EXISTS photo_datetime TIMESTAMPTZ;

COMMENT ON COLUMN "Sales".customer_photo.photo_datetime IS 'Дата и время съёмки фотографии';
