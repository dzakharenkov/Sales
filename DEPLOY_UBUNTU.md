# Развёртывание на сервере Ubuntu (sales.zakharenkov.ru)

## 1. Копирование файлов на сервер

### Вариант A: через SCP (PowerShell на Windows)

```powershell
cd d:\Python\Sales

# Заменить USER на ваше имя пользователя на сервере
$SERVER = "dima@45.141.76.83"
$REMOTE_PATH = "/var/www/sales.zakharenkov.ru/html"   # путь на сервере

# Создать папку на сервере (один раз) 
ssh $SERVER "mkdir -p $REMOTE_PATH"

# Скопировать все нужные файлы
scp -r src requirements.txt .env.example postgres.py sales_sql.sql $SERVER:$REMOTE_PATH/
```

### Вариант B: через rsync (если установлен)

```powershell
cd d:\Python\Sales

rsync -avz --exclude '__pycache__' --exclude '*.pyc' --exclude '.env' --exclude '.git' `
  src/ requirements.txt .env.example postgres.py `
  USER@45.141.76.83:/home/USER/sales/
```

### Вариант C: вручную (FileZilla, WinSCP и т.п.)

Скопировать на сервер:
- папку `src` (вся целиком)
- `requirements.txt`
- `.env.example`
- `postgres.py` (если используется)
- `sales_sql.sql` (если нужна инициализация БД)

**Не копировать:** `.env` (создать на сервере), `__pycache__`, `.git`, `*.bat`

---

## 2. Настройка на сервере Ubuntu

```bash
# Подключиться к серверу
ssh dima@45.141.76.83

cd /var/www/sales.zakharenkov.ru/html

# Создать виртуальное окружение (если ещё нет)
python3 -m venv venv
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Создать .env из примера (если ещё нет)
cp .env.example .env
nano .env   # проверить DATABASE_URL, JWT_SECRET_KEY для продакшена
```

---

## 3. Запуск приложения

### Ручной запуск (для проверки)

```bash
cd /var/www/sales.zakharenkov.ru/html
source venv/bin/activate

uvicorn src.main:app --host 0.0.0.0 --port 5558
```

В другом терминале проверка:
```bash
curl http://127.0.0.1:5558/
# Должен вернуть редирект на /login или HTML страницы входа
```

### systemd (автозапуск при перезагрузке сервера)

1. Остановить uvicorn (`Ctrl+C`), если запущен вручную.

2. Создать сервис:
```bash
sudo tee /etc/systemd/system/sales-fastapi.service > /dev/null <<'EOF'
[Unit]
Description=Sales FastAPI Application
After=network.target

[Service]
Type=simple
User=dima
WorkingDirectory=/var/www/sales.zakharenkov.ru/html
Environment="PATH=/var/www/sales.zakharenkov.ru/html/venv/bin"
ExecStart=/var/www/sales.zakharenkov.ru/html/venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 5558
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
```

3. Запустить сервис:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sales-fastapi.service
sudo systemctl start sales-fastapi.service
```

4. Проверить статус:
```bash
sudo systemctl status sales-fastapi.service
# Active: active (running)
```

5. Проверить порт и ответ:
```bash
netstat -tlnp | grep 5558
curl http://127.0.0.1:5558/
```

6. Логи:
```bash
sudo journalctl -u sales-fastapi.service -f
```

**Полезные команды:**
```bash
sudo systemctl restart sales-fastapi.service   # перезапуск
sudo systemctl stop sales-fastapi.service      # остановка
sudo systemctl start sales-fastapi.service     # запуск
```

---

## 4. Nginx (если используется reverse proxy)

Если домен sales.zakharenkov.ru идёт через nginx на порт 5558:

```nginx
server {
    listen 80;
    server_name sales.zakharenkov.ru;
    location / {
        proxy_pass http://127.0.0.1:5558;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Проверка

- http://45.141.76.83:5558
- https://sales.zakharenkov.ru (если настроен SSL и nginx)

---

## 6. Важно: это FastAPI, не Flask

**В проекте Sales нет файла `app.py` и нет `index.html`.**

- Приложение: **FastAPI** (`src/main.py`)
- Запуск: `uvicorn src.main:app`
- Точка входа: `/` → редирект на `/login` → `src/static/login.html`

Если видите ошибку **TemplateNotFound: login.html** — на сервере запущен **Flask** (`app.py`), а не наше приложение.

### Что сделать

1. **Удалить или переименовать** `app.py` в папке сайта, если он там есть (это не наш проект).
2. **Убедиться**, что запущен именно uvicorn (порт 5558):
   ```bash
   cd /var/www/sales.zakharenkov.ru/html
   source venv/bin/activate
   uvicorn src.main:app --host 0.0.0.0 --port 5558
   ```
3. **Nginx/прокси** должен направлять трафик на порт 5558, а не на Flask/mod_wsgi.
4. В панели Beget: отключить автоматический запуск Python (mod_wsgi) для этого сайта, использовать прокси на порт 5558 или запуск через systemd.

### Структура файлов на сервере

```
/var/www/sales.zakharenkov.ru/html/
├── src/
│   ├── main.py          ← точка входа FastAPI
│   └── static/
│       ├── login.html   ← страница входа
│       └── app.html     ← основное приложение
├── requirements.txt
├── .env
├── venv/
└── sales_sql.sql
```

**Нет:** `app.py`, `index.html`, папки `templates/`
