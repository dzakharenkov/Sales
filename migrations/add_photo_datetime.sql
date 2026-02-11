-- Миграция: добавление даты и времени съёмки к таблице customer_photo
-- Выполнить: psql -f migrations/add_photo_datetime.sql

ALTER TABLE "Sales".customer_photo ADD COLUMN IF NOT EXISTS photo_datetime TIMESTAMPTZ;

COMMENT ON COLUMN "Sales".customer_photo.photo_datetime IS 'Дата и время съёмки фотографии';
