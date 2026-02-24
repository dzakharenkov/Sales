# Deployment Guide

## Pre-Deploy Checklist
- Required env vars configured (`DATABASE_URL`, `JWT_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`).
- `.env` not committed.
- `python -m pytest -q` passes.
- DB connectivity from target host is verified.

## API Deployment (basic)
```bash
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Important Runtime Behavior
- Application fails fast on missing required secrets.
- Startup checks DB connection before serving traffic.

## Post-Deploy Validation
```bash
curl -X GET http://<host>:8000/health
curl -X GET http://<host>:8000/docs
```

