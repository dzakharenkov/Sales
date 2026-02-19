# Task: CI/CD Pipeline with GitHub Actions

**Task ID:** 019
**Category:** Infrastructure / Quality
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 4 hours
**Dependencies:** 010 (code quality tools), 014 (test suite)

---

## Description

The current deployment process is fully manual: run `save_to_github.bat`, SSH to server, pull, restart. There's no automated testing on commit, no validation that the code actually works before deployment. Set up GitHub Actions for automated linting, testing, and optional deployment.

---

## Acceptance Criteria

- [x] GitHub Actions workflow runs on every push to `main` and every PR
- [x] `lint` job: ruff check must pass
- [x] `test` job: pytest must pass with >=50% coverage
- [x] `security` job: runs basic security scan (bandit via ruff `S` rules)
- [x] Failed CI blocks PR merge (branch protection rules)
- [x] Deployment job (optional): deploys to Ubuntu server on push to `main` (manual approval gate)
- [x] CI status badge added to project README

---

## Technical Details

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: "3.13"

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: pip

      - name: Install dev dependencies
        run: pip install ruff mypy

      - name: Run ruff linter
        run: ruff check src/ tests/

      - name: Run ruff formatter check
        run: ruff format --check src/ tests/

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: sds_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: pip

      - name: Install dependencies
        run: pip install -r requirements.txt -r requirements-dev.txt

      - name: Create test .env
        run: |
          cat > .env << EOF
          DATABASE_URL=postgresql+asyncpg://postgres:testpass@localhost:5432/sds_test
          JWT_SECRET_KEY=test-secret-key-for-ci-minimum-32-chars
          TELEGRAM_BOT_TOKEN=test-token
          SENTRY_ENABLED=false
          LOG_LEVEL=WARNING
          EOF

      - name: Run database migrations
        run: alembic upgrade head
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:testpass@localhost:5432/sds_test

      - name: Run tests with coverage
        run: pytest tests/unit/ tests/integration/ -v --cov=src --cov-report=xml --cov-fail-under=50

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
          fail_ci_if_error: false

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install ruff
        run: pip install ruff

      - name: Run security rules
        run: ruff check src/ --select S --output-format github
```

### `.github/workflows/deploy.yml` (Optional - Manual Trigger)

```yaml
name: Deploy to Production

on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      confirm:
        description: 'Type "deploy" to confirm'
        required: true

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'deploy'
    environment: production  # Requires GitHub environment approval

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/sales
            git pull origin main
            source venv/bin/activate
            pip install -r requirements.txt
            alembic upgrade head
            systemctl restart sds-api
            systemctl restart sds-bot
            echo "Deployment complete"
```

### GitHub Repository Configuration

1. **Branch Protection Rules** (Settings â†’ Branches â†’ Add rule for `main`):
   - âœ… Require status checks to pass before merging
   - âœ… Require branches to be up to date
   - âœ… Status checks: `lint`, `test`, `security-scan`
   - âœ… Restrict who can push to matching branches

2. **Repository Secrets** (Settings â†’ Secrets):
   - `SERVER_HOST` â€” production server IP
   - `SERVER_USER` â€” SSH username
   - `SSH_PRIVATE_KEY` â€” SSH private key for deployment

3. **Environment** (Settings â†’ Environments):
   - Create `production` environment with required reviewers

### README Badge

```markdown
[![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

---

## Testing Requirements

- Push code with a ruff error â†’ CI `lint` job fails, PR blocked
- Push code with failing test â†’ CI `test` job fails, PR blocked
- Push valid code â†’ all jobs pass, PR can be merged
- Manual deployment trigger requires typing "deploy" and environment approval

---

## Related Documentation

- [CURRENT_STATE.md â€” Missing Components: CI/CD](../CURRENT_STATE.md)
- Task 010 (Code quality tools)
- Task 014 (Test suite)
- Task 005 (Alembic â€” used in CI for DB setup)

