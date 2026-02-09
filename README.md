# Sale & Distribution System (SDS)

API для управления продажами и дистрибуцией. База данных PostgreSQL на сервере.

## Запуск под Windows

- **Рекомендуется Python 3.11 или 3.12.** На Python 3.13 у части пакетов (pydantic-core) может не быть готовых сборок — тогда установка попытается собрать их через Rust и выдаст ошибку. В этом случае установите Python 3.11/3.12 или используйте виртуальное окружение с ними.

1. **Установка зависимостей**  
   `run.bat` сам ставит пакеты только из готовых бинарников (без сборки). Или вручную:
   ```bat
   pip install -r requirements.txt
   ```
   Если появляется ошибка про Rust / `pydantic-core` — установите только бинарники:
   ```bat
   pip install --only-binary :all: -r requirements.txt
   ```

2. **Переменные окружения**  
   Скопируйте `.env.example` в `.env` и при необходимости измените параметры БД. Если не создавать `.env`, используются значения по умолчанию (как в `postgres.py`).

3. **Запуск сервера**
   ```bat
   run.bat
   ```
   или:
   ```bat
   python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Проверка в браузере**
   - Главная: http://127.0.0.1:8000/
   - Swagger UI (тест API): http://127.0.0.1:8000/docs
   - ReDoc: http://127.0.0.1:8000/redoc
   - Здоровье: http://127.0.0.1:8000/health

## Вход в систему (логин и пароль)

1. **Один раз** задайте пароль администратору (в папке проекта):
   ```bat
   python set_admin_password.py
   ```
   На запросы просто нажмите Enter — будут использованы логин **dzakharenkov** и пароль **admin123**. Либо укажите свои: `python set_admin_password.py dzakharenkov МойПароль`.

2. Запустите сервер: `run.bat` (или `python -m uvicorn src.main:app --host 0.0.0.0 --port 8000`).

3. В браузере откройте: **http://127.0.0.1:8000** (или http://127.0.0.1:8000/login).

4. На странице входа введите:
   - **Логин:** dzakharenkov  
   - **Пароль:** admin123  

5. Нажмите **Войти**. Вы попадёте в систему; там будет ссылка на документацию API (товары, пользователи, клиенты). Токены вводить не нужно — они используются страницей автоматически.

## Основные эндпоинты (после входа — подставьте токен в Authorize)

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/v1/auth/login` | Вход (login, password) → JWT |
| GET/POST/PUT/DELETE | `/api/v1/dictionary/products` | Товары (создание/изменение/удаление — только admin) |
| GET | `/api/v1/dictionary/warehouses` | Склады |
| GET | `/api/v1/users`, POST `/api/v1/users`, POST `/api/v1/users/{login}/set-password` | Пользователи (только admin) |
| GET/POST | `/api/v1/customers` | Клиенты |

## Структура проекта

См. **STRUCTURE.md**. Кратко:

```
├── src/
│   ├── main.py
│   ├── core/               # security (JWT, пароли), deps (get_current_user)
│   ├── database/
│   └── api/v1/routers/     # auth, users, dictionary, customers
├── set_admin_password.py   # Установка пароля админу
├── run.bat
├── requirements.txt
└── .env.example
```

БД должна быть доступна по параметрам из `postgres.py` (или из `.env`).
