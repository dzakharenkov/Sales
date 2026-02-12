-- Миграция: таблицы для Telegram-бота SDS v2.1
-- Выполнить: psql -U postgres -d localdb -f migrations/add_telegram_tables.sql

-- Сессии
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

-- Логи
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

-- Попытки входа
CREATE TABLE IF NOT EXISTS "Sales".telegram_login_attempts (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_tg_login_attempts_user ON "Sales".telegram_login_attempts(telegram_user_id, attempted_at DESC);