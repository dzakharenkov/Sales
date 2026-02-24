markdown
# 🚀 DEVOPS EXECUTION PROMPT
## Universal Template for ANY Project

**Role:** DevOps / CI-CD Engineer  
**Directory:** `/devops-work/`  
**Purpose:** Manage infrastructure, CI/CD, deployment, and monitoring

---

## YOUR RESPONSIBILITIES

1. **Infrastructure Setup** — Server, database, networking
2. **CI/CD Pipeline** — Automated testing and deployment
3. **Deployment** — Release code to environments
4. **Monitoring** — Track performance and errors
5. **Scaling** — Handle load increases
6. **Backup & Recovery** — Data protection

---

## STEP 1: CREATE INFRASTRUCTURE.md

File: `devops-work/INFRASTRUCTURE.md`

```markdown  
# Infrastructure Setup — [PROJECT_NAME]  

## Environments  

### Development  
- **Server:** localhost:8000  
- **Database:** PostgreSQL local  
- **Cache:** Redis local  
- **Logging:** Console  

### Staging  
- **Server:** staging.example.com  
- **Database:** PostgreSQL 15 (Managed)  
- **Cache:** Redis (Managed)  
- **Logging:** ELK Stack  
- **Monitoring:** Prometheus + Grafana  

### Production  
- **Server:** api.example.com  
- **Database:** PostgreSQL 15 Multi-AZ (Managed)  
- **Cache:** Redis Cluster (Managed)  
- **Logging:** ELK Stack  
- **Monitoring:** Prometheus + Grafana  
- **CDN:** CloudFront  
- **Load Balancer:** Application Load Balancer  

---  

## Services  

### [Project Name] API  
- **Container:** Docker  
- **Instances:** 3 (Dev: 1, Staging: 2, Prod: 3)  
- **Port:** 8000  
- **Health Check:** GET /health  

### PostgreSQL  
- **Version:** 15  
- **Backup:** Daily snapshots  
- **Replication:** Multi-AZ  
- **Connection Pool:** pgBouncer  

### Redis  
- **Version:** 7.0  
- **Memory:** 1GB (Prod)  
- **Replication:** Redis Sentinel  

---  

## Networking  

### VPC  
- **CIDR:** 10.0.0.0/16  
- **Subnets:** Public (2), Private (2)  
- **NAT Gateway:** 1 per AZ  
- **Route Tables:** Custom  

### Security Groups  
API:

Inbound: 80 (HTTP), 443 (HTTPS), 8000 (Dev)
Outbound: All
Database:

Inbound: 5432 (from API only)
Outbound: None
Cache:

Inbound: 6379 (from API only)
Outbound: None
markdown

---

## Volumes

### Application
- **Size:** 50GB
- **Type:** GP3
- **Backup:** Daily snapshots

### Database
- **Size:** 200GB
- **Type:** GP3 RAID-1
- **Backup:** Continuous replication

---

## Cost Estimate
- **Servers:** $200/month
- **Database:** $300/month
- **Cache:** $50/month
- **Storage:** $100/month
- **Total:** ~$650/month (Prod)
STEP 2: CREATE CI/CD PIPELINE
File: devops-work/CICD_PIPELINE.md

markdown
# CI/CD Pipeline — [PROJECT_NAME]

## GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml  
name: CI/CD Pipeline  

on:  
  push:  
    branches: [main, develop]  
  pull_request:  
    branches: [main, develop]  

jobs:  
  test:  
    runs-on: ubuntu-latest  
    services:  
      postgres:  
        image: postgres:15  
        env:  
          POSTGRES_PASSWORD: postgres  
        options: >-  
          --health-cmd pg_isready  
          --health-interval 10s  
          --health-timeout 5s  
          --health-retries 5  
    
    steps:  
      - uses: actions/checkout@v3  
      
      - name: Set up Python  
        uses: actions/setup-python@v4  
        with:  
          python-version: '3.11'  
      
      - name: Install dependencies  
        run: |  
          python -m pip install --upgrade pip  
          pip install -r requirements.txt  
      
      - name: Run tests  
        run: pytest tests/ -v --cov=src  
      
      - name: Run linting  
        run: |  
          flake8 src/  
          mypy src/  
          black --check src/  
      
      - name: Security scan  
        run: |  
          bandit -r src/  
          safety check  
      
      - name: Upload coverage  
        uses: codecov/codecov-action@v3  
        with:  
          files: ./coverage.xml  

  build:  
    needs: test  
    runs-on: ubuntu-latest  
    if: github.event_name == 'push'  
    
    steps:  
      - uses: actions/checkout@v3  
      
      - name: Build Docker image  
        run: |  
          docker build -t ${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_IMAGE }}:${{ github.sha }} .  
          docker build -t ${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_IMAGE }}:latest .  
      
      - name: Push to registry  
        run: |  
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin  
          docker push ${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_IMAGE }}:${{ github.sha }}  
          docker push ${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_IMAGE }}:latest  

  deploy:  
    needs: build  
    runs-on: ubuntu-latest  
    if: github.ref == 'refs/heads/main'  
    
    steps:  
      - uses: actions/checkout@v3  
      
      - name: Deploy to production  
        env:  
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}  
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}  
        run: |  
          mkdir -p ~/.ssh  
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key  
          chmod 600 ~/.ssh/deploy_key  
          ssh -i ~/.ssh/deploy_key deploy@$DEPLOY_HOST 'bash /opt/deploy.sh'  
Pipeline Stages
Test — Run all tests and quality checks
Build — Build Docker image
Push — Push to Docker registry
Deploy — Deploy to staging/production
Triggers
Develop branch: Test + Deploy to Staging
Main branch: Test + Build + Deploy to Production
Pull requests: Test only
bash

---

## STEP 3: CREATE DOCKERFILE

File: `Dockerfile`

```dockerfile  
# Build stage  
FROM python:3.11-slim as builder  

WORKDIR /build  

RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*  

COPY requirements.txt .  
RUN pip install --user --no-cache-dir -r requirements.txt  

# Runtime stage  
FROM python:3.11-slim  

WORKDIR /app  

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*  

COPY --from=builder /root/.local /root/.local  
ENV PATH=/root/.local/bin:$PATH  

COPY . .  

EXPOSE 8000  

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"  

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]  
STEP 4: CREATE DOCKER-COMPOSE
File: docker-compose.yml

yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/app
      - REDIS_URL=redis://cache:6379/0
      - LOG_LEVEL=INFO
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    volumes:
      - ./src:/app/src

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
STEP 5: CREATE DEPLOYMENT REPORT
File: devops-work/REPORTS/001-deployment.md

markdown
# Deployment Report: 001 — [Task Name]

**Date:** 2026-02-19 15:30 UTC  
**Environment:** Production  
**Status:** ✅ SUCCESSFUL  

---

## Deployment Info

**Version:** 1.0.0  
**Commit:** abc123def456  
**Docker Image:** registry.example.com/app:abc123def456  

---

## Pre-Deployment Checks

- [x] All tests passing (45/45)
- [x] Code coverage ≥ 90% (95%)
- [x] Security scan passed
- [x] Load testing passed (1000 req/s)
- [x] Database migrations ready
- [x] Rollback plan documented

---

## Deployment Steps

1. ✅ Build Docker image
2. ✅ Push to registry
3. ✅ Update Kubernetes deployment
4. ✅ Wait for pods to be ready (120s)
5. ✅ Run smoke tests
6. ✅ Monitor for errors (5 min)

---

## Smoke Tests

✅ GET /health → 200 OK
✅ GET /api/v1/items → 200 OK
✅ POST /api/v1/items → 201 Created
✅ Database connection → OK
✅ Redis connection → OK

yaml

---

## Monitoring

CPU Usage: 25%
Memory Usage: 350MB / 500MB
Request Latency: 120ms avg
Error Rate: 0.01%
Uptime: 100%

yaml

---

## Rollback Plan

If issues detected:
```bash  
kubectl set image deployment/api \
  api=registry.example.com/app:v1.0.0  
Next Steps
✅ Deployment complete
✅ All systems nominal
✅ Monitoring active

yaml

---

## COMMAND TO START

Deploy: architect-work/TASKS/001-task-name.md

markdown

I will:
1. ✅ Prepare infrastructure
2. ✅ Build artifacts
3. ✅ Run deployment pipeline
4. ✅ Verify in each environment
5. ✅ Create deployment report
6. ✅ Setup monitoring