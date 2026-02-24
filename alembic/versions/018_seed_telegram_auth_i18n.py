"""seed telegram auth/menu i18n keys

Revision ID: 018_seed_telegram_auth_i18n
Revises: 017_seed_system_title
Create Date: 2026-02-21 09:30:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "018_seed_telegram_auth_i18n"
down_revision: Union[str, Sequence[str], None] = "017_seed_system_title"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          x.translation_key,
          x.language_code,
          x.translation_text,
          'telegram',
          'migration_018'
        FROM (
          VALUES
            ('telegram.menu.main_text','ru','🏠 *{title}*\\n\\n{fio} ({role})'),
            ('telegram.menu.main_text','uz','🏠 *{title}*\\n\\n{fio} ({role})'),
            ('telegram.menu.main_text','en','🏠 *{title}*\\n\\n{fio} ({role})'),

            ('telegram.button.route','ru','🗺 Мой маршрут'),
            ('telegram.button.route','uz','🗺 Mening marshrutim'),
            ('telegram.button.route','en','🗺 My route'),
            ('telegram.button.my_orders_today','ru','📦 Мои заказы на сегодня'),
            ('telegram.button.my_orders_today','uz','📦 Bugungi buyurtmalarim'),
            ('telegram.button.my_orders_today','en','📦 My orders for today'),
            ('telegram.button.done_today','ru','✅ Выполненные сегодня'),
            ('telegram.button.done_today','uz','✅ Bugun bajarilganlar'),
            ('telegram.button.done_today','en','✅ Completed today'),
            ('telegram.button.my_stock','ru','📊 Мои остатки'),
            ('telegram.button.my_stock','uz','📊 Mening qoldiqlarim'),
            ('telegram.button.my_stock','en','📊 My stock'),
            ('telegram.button.get_payment','ru','💰 Получить оплату'),
            ('telegram.button.get_payment','uz','💰 To''lovni qabul qilish'),
            ('telegram.button.get_payment','en','💰 Receive payment'),
            ('telegram.button.received_payments','ru','💵 Полученная оплата'),
            ('telegram.button.received_payments','uz','💵 Qabul qilingan to''lovlar'),
            ('telegram.button.received_payments','en','💵 Received payments'),
            ('telegram.button.create_visit','ru','🆕 Создать визит'),
            ('telegram.button.create_visit','uz','🆕 Tashrif yaratish'),
            ('telegram.button.create_visit','en','🆕 Create visit'),
            ('telegram.button.my_visits','ru','📋 Мои визиты'),
            ('telegram.button.my_visits','uz','📋 Mening tashriflarim'),
            ('telegram.button.my_visits','en','📋 My visits'),
            ('telegram.button.add_customer','ru','➕ Добавить клиента'),
            ('telegram.button.add_customer','uz','➕ Mijoz qo''shish'),
            ('telegram.button.add_customer','en','➕ Add customer'),
            ('telegram.button.update_customer_location','ru','📍 Обновить локацию клиента'),
            ('telegram.button.update_customer_location','uz','📍 Mijoz lokatsiyasini yangilash'),
            ('telegram.button.update_customer_location','en','📍 Update customer location'),
            ('telegram.button.upload_customer_photo','ru','📸 Загрузить фото клиента'),
            ('telegram.button.upload_customer_photo','uz','📸 Mijoz suratini yuklash'),
            ('telegram.button.upload_customer_photo','en','📸 Upload customer photo'),
            ('telegram.button.create_order','ru','🛒 Создать заказ'),
            ('telegram.button.create_order','uz','🛒 Buyurtma yaratish'),
            ('telegram.button.create_order','en','🛒 Create order'),
            ('telegram.button.profile','ru','👤 Профиль'),
            ('telegram.button.profile','uz','👤 Profil'),
            ('telegram.button.profile','en','👤 Profile'),
            ('telegram.button.logout','ru','🚪 Выход'),
            ('telegram.button.logout','uz','🚪 Chiqish'),
            ('telegram.button.logout','en','🚪 Logout'),
            ('telegram.button.yes_logout','ru','✅ Да, выйти'),
            ('telegram.button.yes_logout','uz','✅ Ha, chiqish'),
            ('telegram.button.yes_logout','en','✅ Yes, logout'),
            ('telegram.button.edit_login','ru','Изменить логин'),
            ('telegram.button.edit_login','uz','Loginni o''zgartirish'),
            ('telegram.button.edit_login','en','Change login'),

            ('telegram.auth.session_expired','ru','Сессия истекла. Нажмите /start для повторной авторизации.'),
            ('telegram.auth.session_expired','uz','Sessiya muddati tugadi. Qayta kirish uchun /start ni bosing.'),
            ('telegram.auth.session_expired','en','Session expired. Press /start to sign in again.'),
            ('telegram.auth.too_many_attempts','ru','⛔ Слишком много неудачных попыток входа.\\nПодождите {minutes} минут и попробуйте снова.'),
            ('telegram.auth.too_many_attempts','uz','⛔ Juda ko''p noto''g''ri urinishlar.\\n{minutes} daqiqadan so''ng qayta urinib ko''ring.'),
            ('telegram.auth.too_many_attempts','en','⛔ Too many failed sign-in attempts.\\nWait {minutes} minutes and try again.'),
            ('telegram.auth.too_many_attempts_short','ru','⛔ Слишком много попыток. Подождите {minutes} минут.'),
            ('telegram.auth.too_many_attempts_short','uz','⛔ Juda ko''p urinishlar. {minutes} daqiqa kuting.'),
            ('telegram.auth.too_many_attempts_short','en','⛔ Too many attempts. Wait {minutes} minutes.'),
            ('telegram.auth.welcome_prompt','ru','👋 Добро пожаловать в *бот системы управления продажами и дистрибуцией*!\\n\\nДля начала работы необходимо авторизоваться.\\n\\nВведите ваш *логин*:'),
            ('telegram.auth.welcome_prompt','uz','👋 *SDS botiga xush kelibsiz*!\\n\\nIshni boshlash uchun tizimga kiring.\\n\\n*Loginingizni* kiriting:'),
            ('telegram.auth.welcome_prompt','en','👋 Welcome to the *SDS sales and distribution bot*!\\n\\nPlease sign in to continue.\\n\\nEnter your *login*:'),
            ('telegram.auth.enter_login','ru','Введите логин:'),
            ('telegram.auth.enter_login','uz','Loginni kiriting:'),
            ('telegram.auth.enter_login','en','Enter login:'),
            ('telegram.auth.login_saved_enter_password','ru','Логин: {login}\\nВведите пароль или нажмите «Изменить логин».'),
            ('telegram.auth.login_saved_enter_password','uz','Login: {login}\\nParolni kiriting yoki «Loginni o''zgartirish» ni bosing.'),
            ('telegram.auth.login_saved_enter_password','en','Login: {login}\\nEnter password or press \"Change login\".'),
            ('telegram.auth.canceled','ru','Авторизация отменена. Нажмите /start чтобы начать.'),
            ('telegram.auth.canceled','uz','Avtorizatsiya bekor qilindi. Qayta boshlash uchun /start ni bosing.'),
            ('telegram.auth.canceled','en','Authorization canceled. Press /start to begin.'),
            ('telegram.auth.blocked_now','ru','❌ Неверные данные. Вход заблокирован на {minutes} мин.'),
            ('telegram.auth.blocked_now','uz','❌ Noto''g''ri ma''lumotlar. Kirish {minutes} daqiqaga bloklandi.'),
            ('telegram.auth.blocked_now','en','❌ Invalid credentials. Sign-in is blocked for {minutes} minutes.'),
            ('telegram.auth.invalid_credentials_retry','ru','❌ Неверный логин или пароль.\\nОсталось попыток: *{remaining}* из {max_attempts}\\n\\nЛогин: *{login}*\\nВведите *пароль* или нажмите «✏️ Изменить логин»:'),
            ('telegram.auth.invalid_credentials_retry','uz','❌ Login yoki parol noto''g''ri.\\nQolgan urinishlar: *{remaining}* / {max_attempts}\\n\\nLogin: *{login}*\\n*Parolni* kiriting yoki «✏️ Loginni o''zgartirish» ni bosing:'),
            ('telegram.auth.invalid_credentials_retry','en','❌ Invalid login or password.\\nAttempts left: *{remaining}* of {max_attempts}\\n\\nLogin: *{login}*\\nEnter *password* or press \"✏️ Change login\":'),
            ('telegram.auth.login_success','ru','✅ Вход в систему SDS выполнен: {login}'),
            ('telegram.auth.login_success','uz','✅ SDS tizimiga kirildi: {login}'),
            ('telegram.auth.login_success','en','✅ Signed in to SDS: {login}'),
            ('telegram.auth.session_not_found','ru','Сессия не найдена. Нажмите /start.'),
            ('telegram.auth.session_not_found','uz','Sessiya topilmadi. /start ni bosing.'),
            ('telegram.auth.session_not_found','en','Session not found. Press /start.'),
            ('telegram.auth.role_changed_to','ru','⚠️ Ваша роль изменена на: {role}'),
            ('telegram.auth.role_changed_to','uz','⚠️ Sizning rolingiz o''zgartirildi: {role}'),
            ('telegram.auth.role_changed_to','en','⚠️ Your role has been changed to: {role}'),
            ('telegram.auth.logout_confirm','ru','Вы действительно хотите выйти?'),
            ('telegram.auth.logout_confirm','uz','Rostdan ham chiqmoqchimisiz?'),
            ('telegram.auth.logout_confirm','en','Do you really want to logout?'),
            ('telegram.auth.goodbye','ru','👋 До свидания!\\n\\nДля входа нажмите /start.'),
            ('telegram.auth.goodbye','uz','👋 Xayr!\\n\\nKirish uchun /start ni bosing.'),
            ('telegram.auth.goodbye','en','👋 Goodbye!\\n\\nPress /start to sign in.'),

            ('telegram.lang.choose','ru','Выберите язык:'),
            ('telegram.lang.choose','uz','Tilni tanlang:'),
            ('telegram.lang.choose','en','Choose language:'),
            ('telegram.lang.updated','ru','Язык переключен на: {lang}'),
            ('telegram.lang.updated','uz','Til o''zgartirildi: {lang}'),
            ('telegram.lang.updated','en','Language switched to: {lang}'),

            ('telegram.profile.title','ru','Профиль пользователя'),
            ('telegram.profile.title','uz','Foydalanuvchi profili'),
            ('telegram.profile.title','en','User profile'),
            ('telegram.profile.fio','ru','ФИО'),
            ('telegram.profile.fio','uz','F.I.Sh.'),
            ('telegram.profile.fio','en','Full name'),
            ('telegram.profile.login','ru','Логин'),
            ('telegram.profile.login','uz','Login'),
            ('telegram.profile.login','en','Login'),
            ('telegram.profile.role','ru','Роль'),
            ('telegram.profile.role','uz','Rol'),
            ('telegram.profile.role','en','Role'),
            ('telegram.profile.phone','ru','Телефон'),
            ('telegram.profile.phone','uz','Telefon'),
            ('telegram.profile.phone','en','Phone'),
            ('telegram.profile.email','ru','Email'),
            ('telegram.profile.email','uz','Email'),
            ('telegram.profile.email','en','Email'),
            ('telegram.profile.card','ru','👤 *{title}*\\n\\n*{fio_label}:* {fio}\\n*{login_label}:* {login}\\n*{role_label}:* {role}\\n*{phone_label}:* {phone}\\n*{email_label}:* {email}\\n'),
            ('telegram.profile.card','uz','👤 *{title}*\\n\\n*{fio_label}:* {fio}\\n*{login_label}:* {login}\\n*{role_label}:* {role}\\n*{phone_label}:* {phone}\\n*{email_label}:* {email}\\n'),
            ('telegram.profile.card','en','👤 *{title}*\\n\\n*{fio_label}:* {fio}\\n*{login_label}:* {login}\\n*{role_label}:* {role}\\n*{phone_label}:* {phone}\\n*{email_label}:* {email}\\n')
        ) AS x(translation_key, language_code, translation_text)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_018'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE created_by = 'migration_018' OR updated_by = 'migration_018'
        """
    )
