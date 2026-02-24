# Bug Report: Pytest failure in logging middleware token classification

**Task:** 023
**Severity:** MEDIUM
**Status:** OPEN

## Description
Automated tests are not fully green. One test fails in logging middleware behavior for invalid bearer token classification.

## Steps to Reproduce
1. Set environment: `$env:PYTHONPATH='.'`
2. Run: `pytest tests/ -v --cov=src --cov-report=term`
3. Observe failure in `tests/test_logging_middleware.py::test_extract_user_login_unknown_for_invalid_token`

## Expected Result
For invalid bearer token, `_extract_user_login(request)` should return `"unknown"`.

## Actual Result
Function returns `"anonymous"`.

## Error Logs
`AssertionError: assert 'anonymous' == 'unknown'`

## File References
- `tests/test_logging_middleware.py:26`
- `src/core/middleware.py:29`

## Environment
- OS: Windows
- Python: 3.13.3
- Pytest: 9.0.2
