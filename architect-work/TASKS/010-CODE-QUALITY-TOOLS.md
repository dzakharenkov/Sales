# Task: Code Linting & Formatting Setup

**Task ID:** 010
**Category:** Setup / Quality
**Priority:** MEDIUM
**Status:** COMPLETED
**Estimated Time:** 2 hours
**Dependencies:** None (can be done in parallel with others)

---

## Description

The project has no code quality tools configured. No linter, no formatter, no type checker. This leads to inconsistent code style, potential bugs from wrong types, and slow code review. Set up `ruff` (linting + formatting), `mypy` (type checking), and pre-commit hooks.

---

## Acceptance Criteria

- [x] `pyproject.toml` created with ruff and mypy configuration
- [x] `.pre-commit-config.yaml` created with ruff, mypy checks
- [x] All existing code passes ruff linting (or violations documented for gradual fixing)
- [x] `make lint` and `make format` commands available
- [x] CI pipeline runs linting (see Task 036)
- [x] `requirements-dev.txt` created with development tools

---

## Technical Details

### `pyproject.toml`

```toml
[tool.ruff]
target-version = "py313"
line-length = 100
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "UP",  # pyupgrade
    "S",   # bandit (security)
    "N",   # pep8-naming
]
ignore = [
    "S101",  # Use of assert (needed in tests)
    "B008",  # Do not perform function calls in default arguments (FastAPI uses Depends())
    "S603",  # subprocess without shell (ok in deployment scripts)
]
exclude = [
    "ÐÑ€Ñ…Ð¸Ð²/",
    "alembic/versions/",
]

[tool.ruff.per-file-ignores]
"tests/*" = ["S", "N"]  # Relax security and naming rules in tests

[tool.mypy]
python_version = "3.13"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
ignore_missing_imports = true
exclude = ["ÐÑ€Ñ…Ð¸Ð²/", "alembic/"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --tb=short"
```

### `requirements-dev.txt`

```
# Code quality
ruff>=0.3.0
mypy>=1.8.0
pre-commit>=3.6.0

# Testing
pytest>=8.0.0
pytest-asyncio>=0.23.0
pytest-cov>=4.1.0
httpx>=0.27.0  # For FastAPI test client

# Development utilities
ipython>=8.0.0
```

### `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ["--maxkb=500"]
      - id: check-merge-conflict
      - id: detect-private-key  # Catch accidental credential commits

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        args: [--ignore-missing-imports]
        additional_dependencies: [pydantic>=2.5.0]
```

### `Makefile` (optional but useful)

```makefile
.PHONY: lint format typecheck test

lint:
	ruff check src/ tests/

format:
	ruff format src/ tests/

typecheck:
	mypy src/

test:
	pytest tests/ -v --cov=src --cov-report=html

install-dev:
	pip install -r requirements.txt -r requirements-dev.txt
	pre-commit install

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -name "*.pyc" -delete
```

### Install Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files  # First run to fix existing issues
```

---

## Testing Requirements

- `ruff check src/` runs without critical errors (fix or suppress all issues)
- `ruff format src/` runs without errors
- `pre-commit run --all-files` completes without blocking failures
- CI job `lint` passes (see Task 036)

---

## Related Documentation

- Task 036 (CI/CD â€” uses linting tools)
- [CURRENT_STATE.md â€” Code Quality Issues](../CURRENT_STATE.md)

---

## Notes

- Run `ruff check src/ --fix` first to auto-fix many issues
- Address remaining violations manually or add `# noqa: E501` with justification
- `detect-private-key` hook in pre-commit helps catch accidental `.env` commits
- mypy may require adding type stubs: `pip install types-passlib types-python-jose`

