# Infrastructure Setup - Sales & Distribution System (SDS)

## Environments

### Development
- Server: `localhost:8000`
- API runtime: local `uvicorn`
- Database: local PostgreSQL 15
- Cache: local Redis 7 (optional for future workloads)
- Logging: console + file logs (`logs/`)

### Staging
- Server: `staging.sales.example.com`
- API runtime: Docker container behind reverse proxy
- Database: managed PostgreSQL 15
- Cache: managed Redis 7
- Logging: centralized (Loki/ELK)
- Monitoring: Prometheus + Grafana + Sentry

### Production
- Server: `api.sales.example.com`
- API runtime: Docker container(s) behind load balancer
- Database: managed PostgreSQL 15 (Multi-AZ)
- Cache: managed Redis 7 (replica enabled)
- Logging: centralized (Loki/ELK)
- Monitoring: Prometheus + Grafana + Sentry
- CDN: optional for static/media delivery
- Load balancer: L7 reverse proxy / cloud ALB

---

## Services

### SDS API
- Container: Docker
- Instances: Dev 1 / Staging 2 / Prod 3
- Port: `8000`
- Health check: `GET /health`
- Entrypoint: `uvicorn src.main:app --host 0.0.0.0 --port 8000`

### PostgreSQL
- Version: 15
- Backup: daily snapshots + WAL retention
- Replication: Multi-AZ in production
- Pooling: SQLAlchemy async pool in app (pgBouncer optional)

### Redis
- Version: 7
- Role: cache/rate-limit backend candidate
- Memory target (prod): 1-2 GB initial
- HA: replica + sentinel/managed failover

---

## Networking

### VPC (recommended)
- CIDR: `10.0.0.0/16`
- Subnets: public (2), private app (2), private data (2)
- NAT: 1 per AZ for private outbound
- Route tables: segmented by tier

### Security Groups
- API SG:
  - Inbound: `80`, `443` (internet), `8000` (internal/dev only)
  - Outbound: to DB `5432`, cache `6379`, required egress
- DB SG:
  - Inbound: `5432` from API SG only
  - Outbound: restricted
- Cache SG:
  - Inbound: `6379` from API SG only
  - Outbound: restricted

---

## Storage Volumes

### Application
- Size: 50 GB (initial)
- Type: GP3/NVMe equivalent
- Backups: daily snapshots

### Database
- Size: 200 GB (initial)
- Type: managed SSD volume (GP3 or equivalent)
- Backups: automated snapshots + PITR

---

## Monitoring & Alerting
- Application errors: Sentry (`SENTRY_DSN`)
- Metrics: Prometheus scrape (`/health` + infra exporters)
- Dashboards: Grafana (latency, error rate, DB pool, CPU/RAM)
- Alerts:
  - API availability < 99.9%
  - p95 latency > 500ms
  - 5xx rate > 2%
  - DB connections saturation > 80%

---

## Backup & Recovery
- DB backups: daily full + WAL for point-in-time recovery
- Retention: 14-30 days by environment
- Recovery drill: monthly restore test in staging
- RPO target: <= 15 minutes
- RTO target: <= 60 minutes

---

## Cost Estimate (Production, initial)
- Compute: $180-260/month
- Database: $250-400/month
- Cache: $40-90/month
- Storage + transfer + monitoring: $80-180/month
- Total: ~$550-930/month
