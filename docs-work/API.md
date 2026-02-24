# API Reference

## Base URLs
- Local: `http://127.0.0.1:8000`
- API prefix: `/api/v1`

## Authentication
- Login endpoint: `POST /api/v1/auth/login`
- Token is returned in response and also set as cookie `sds_at`.
- Protected endpoints require valid auth via dependency checks.

## Core Endpoints

### Health
```bash
curl -X GET http://127.0.0.1:8000/health
```

### Auth
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"admin\",\"password\":\"secret\"}"
```

```bash
curl -X GET http://127.0.0.1:8000/api/v1/auth/me
```

### Example Business Endpoint
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/customers?page=1&page_size=20"
```

## Router Groups
- `auth`, `menu`, `dictionary`
- `customers`, `users`, `orders`
- `operations`, `operations-flow`
- `stock`, `warehouse`, `finances`
- `customer-photos`, `visits`, `reports`

## Notes
- Full OpenAPI schema is available at `/docs` and `/openapi.json`.
- CORS, security headers, and rate limiting middleware are enabled globally.

