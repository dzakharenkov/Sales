markdown
# 🔐 SECURITY AUDITOR EXECUTION PROMPT
## Universal Template for ANY Project

**Role:** Security Auditor / Security Engineer  
**Directory:** `security-work/`  
**Purpose:** Identify and mitigate security vulnerabilities

---

## YOUR RESPONSIBILITIES

1. **Vulnerability Scanning** — Find security issues
2. **Code Review** — Security-focused review
3. **Penetration Testing** — Try to break the app
4. **Policy Compliance** — Verify security policies
5. **Incident Response** — Handle security breaches
6. **Security Hardening** — Strengthen defenses

---

## STEP 1: CREATE SECURITY_POLICY.md

File: `security-work/SECURITY_POLICY.md`

```markdown  
# Security Policy — [PROJECT_NAME]  

## Authentication & Authorization  

### Authentication  
- **Method:** JWT Bearer tokens  
- **Expiry:** 24 hours access, 7 days refresh  
- **Storage:** Secure HTTP-only cookies (frontend)  
- **Transport:** HTTPS only  

### Authorization  
- **Model:** Role-Based Access Control (RBAC)  
- **Roles:** Admin, Manager, User, Guest  
- **Permissions:** Granular per resource  

### Password Policy  
- **Minimum Length:** 12 characters  
- **Complexity:** Must include uppercase, lowercase, number, special char  
- **Expiry:** 90 days  
- **History:** Cannot reuse last 5 passwords  
- **Failed Attempts:** Lock after 5 failures, 15 min cooldown  

---  

## Data Protection  

### Encryption in Transit  
- **Protocol:** TLS 1.3+  
- **Certificate:** Self-signed in dev, valid CA in prod  
- **Cipher Suites:** AES-256-GCM  

### Encryption at Rest  
- **Database:** AES-256 encryption  
- **Sensitive Fields:** Encrypted in database  
  - Passwords: bcrypt (12 rounds)  
  - API Keys: Encrypted with master key  
  - PII: Encrypted  

### Key Management  
- **Storage:** AWS Secrets Manager / HashiCorp Vault  
- **Rotation:** Every 90 days  
- **Access:** Principle of least privilege  
- **Audit:** All key access logged  

---  

## Network Security  

### Firewalls  
- **Inbound:** Only necessary ports (80, 443, 8000 for dev)  
- **Outbound:** Only to required services  
- **DDoS:** AWS Shield / Cloudflare  

### API Security  
- **Rate Limiting:** 100 requests per minute per IP  
- **CORS:** Whitelist specific origins  
- **HTTPS:** Required for all endpoints  
- **WAF:** ModSecurity rules for injection attacks  

### Database  
- **Access:** Private subnet, no public IP  
- **Encryption:** In transit (SSL) and at rest  
- **Backup:** Encrypted, stored in separate region  
- **Deletion:** Securely overwritten  

---  

## Code Security  

### Dependencies  
- **Scanning:** Run `safety check`, `pip-audit`, `npm audit` on every build  
- **Updates:** Security patches applied within 24 hours  
- **Removal:** Unused dependencies removed monthly  

### Code Standards  
- **Input Validation:** All user input validated  
- **Output Encoding:** All output properly encoded  
- **SQL Injection:** Parameterized queries only  
- **XSS Prevention:** HTML escaping, CSP headers  
- **CSRF:** CSRF tokens on all state-changing requests  
- **Secrets:** No hardcoded secrets, use env vars  
- **Logging:** Sensitive data not logged  

### Secure Coding  
- **Error Messages:** Generic errors to users  
- **Stack Traces:** Not exposed to users  
- **Comments:** No sensitive info in code  
- **Defaults:** Secure defaults (deny by default)  

---  

## Incident Response  

### Reporting  
- **Email:** security@example.com  
- **Bug Bounty:** Responsible disclosure required  
- **Timeframe:** Response within 24 hours  

### Process  
1. Acknowledge receipt  
2. Investigate issue  
3. Develop patch  
4. Test thoroughly  
5. Deploy fix  
6. Notify users  
7. Post-mortem  

---  

## Compliance  

### Standards  
- **OWASP Top 10:** No violations  
- **GDPR:** Compliant (if EU users)  
- **HIPAA:** Compliant (if health data)  
- **SOC 2:** Audit annually  

### Audits  
- **Frequency:** Quarterly internal, annual external  
- **Penetration Testing:** Annual  
- **Dependency Scan:** Continuous  
- **Code Review:** Every commit  
STEP 2: CREATE VULNERABILITIES.md
File: security-work/VULNERABILITIES.md

markdown
# Known Vulnerabilities — [PROJECT_NAME]

## Current Vulnerabilities

### Vulnerability 1: SQL Injection in User Search
**Severity:** CRITICAL  
**Status:** OPEN  
**Found:** 2026-02-19  
**Component:** `src/api/routes/users.py` (line 42)  

**Description:**
User search endpoint doesn't properly escape input, allowing SQL injection.

**Proof of Concept:**
GET /api/v1/users?search='; DROP TABLE users; --

makefile

**Impact:** Attackers can execute arbitrary SQL, delete data, steal information.

**Fix:**
Use parameterized queries.

```python  
# ❌ VULNERABLE:  
query = f"SELECT * FROM users WHERE name LIKE '%{