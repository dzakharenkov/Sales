# Setup Guide

## Prerequisites
- Python 3.13+
- PostgreSQL (reachable from this app)

## Installation
```bash
git clone <your-repo-url>
cd Sales
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
```

## Environment Configuration
1. Copy `.env.example` to `.env`.
2. Set required variables:
   - `DATABASE_URL`
   - `JWT_SECRET_KEY`
   - `TELEGRAM_BOT_TOKEN`
3. Generate a strong JWT secret:
```bash
python -c "import base64,secrets; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"
```

## Verify Setup
```bash
python -m pytest tests/test_env_validation.py -q
python -m pytest -q
```

