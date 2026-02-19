.PHONY: lint format typecheck test install-dev

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
