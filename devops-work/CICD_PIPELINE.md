# CI/CD Pipeline - Sales & Distribution System (SDS)

## Workflow File
- `.github/workflows/deploy.yml`

## Pipeline Stages
1. Test: install dependencies, run lint/type/tests, run security checks.
2. Build: build Docker image and push tags (`sha`, `latest`) on branch pushes.
3. Deploy Staging: auto deploy from `develop`.
4. Deploy Production: auto deploy from `main`.

## Triggers
- Pull requests to `main`/`develop`: test only.
- Push to `develop`: test + build + deploy staging.
- Push to `main`: test + build + deploy production.

## Required GitHub Secrets
- `DOCKER_REGISTRY`
- `DOCKER_IMAGE`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `STAGING_DEPLOY_HOST`
- `STAGING_DEPLOY_USER`
- `STAGING_DEPLOY_KEY`
- `PROD_DEPLOY_HOST`
- `PROD_DEPLOY_USER`
- `PROD_DEPLOY_KEY`

## Required Runtime Env in CI
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`

## Notes
- Python version aligned to repository config: `3.13`.
- Uses `ruff` + `mypy` + `pytest` and `bandit` + `pip-audit` checks.
- Docker image entrypoint targets `src.main:app`.
