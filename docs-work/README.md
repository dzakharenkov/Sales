# Sales & Distribution System (SDS) Docs

## Overview
SDS is a FastAPI backend with a Telegram bot for sales, customers, orders, warehouse operations, finance, and reporting workflows.

## Features
- REST API (`/api/v1`) with JWT auth and role-based access.
- Web static pages (`/login`, `/app`) and media serving (`/photo`).
- PostgreSQL async access with startup health and integrity checks.
- Security hardening: required environment variables and strong JWT secret validation.

## Tech Stack
- Language: Python 3.13
- Framework: FastAPI
- Database: PostgreSQL (`asyncpg` via SQLAlchemy 2.x)
- Messaging: Telegram Bot API (`python-telegram-bot`)
- Monitoring: Sentry (optional)

## Start Here
- `docs-work/SETUP.md`
- `docs-work/USAGE.md`
- `docs-work/API.md`
- `docs-work/DATABASE.md`
- `docs-work/DEPLOY.md`
- `docs-work/TROUBLESHOOTING.md`
- `docs-work/CODE_STYLE.md`
- `docs-work/CHANGELOG.md`


