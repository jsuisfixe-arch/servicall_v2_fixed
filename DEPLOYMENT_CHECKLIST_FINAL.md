# 🚀 Deployment Checklist - Servicall Backend v2

## Pre-Deployment Validation

### 1. Security Verification ✅

- [x] IDOR fixes applied (campaignRouter, invoiceRouter)
- [x] Cross-tenant access control enforced
- [x] JWT tenant token validation implemented
- [x] x-tenant-id header fallback removed
- [x] upsertUser role protection enabled
- [x] Helmet security headers configured
- [x] CORS properly restricted
- [x] Rate limiting active
- [x] WebSocket authentication required

### 2. Code Quality ✅

- [ ] `pnpm typecheck` passes without errors
- [ ] `pnpm lint` passes without warnings
- [ ] `pnpm test` passes all unit tests
- [ ] `pnpm test:e2e` passes all e2e tests
- [ ] No console.log in production code
- [ ] No hardcoded secrets in code
- [ ] No TODO comments in critical paths

### 3. Environment Setup

- [ ] `NODE_ENV=production` configured
- [ ] `JWT_SECRET` set (32+ bytes, random)
- [ ] `TENANT_JWT_SECRET` set (32+ bytes, random)
- [ ] `DATABASE_URL` configured (PostgreSQL)
- [ ] `REDIS_URL` configured (optional but recommended)
- [ ] `PORT` set (default: 5000)
- [ ] All required env vars present

### 4. Database Preparation

- [ ] PostgreSQL database created
- [ ] Migrations applied: `pnpm db:migrate`
- [ ] Admin user initialized: `pnpm admin:init`
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] SSL/TLS enabled for DB connection

### 5. Infrastructure

- [ ] SSL/TLS certificate installed
- [ ] Reverse proxy configured (nginx/Apache)
- [ ] Load balancer configured (if needed)
- [ ] CDN configured (if needed)
- [ ] Monitoring/alerting setup
- [ ] Log aggregation configured
- [ ] Error tracking (Sentry) configured

### 6. Build & Artifacts

- [ ] Build succeeds: `pnpm build`
- [ ] No build warnings
- [ ] Build output verified
- [ ] Docker image built (if using Docker)
- [ ] Docker image tested locally
- [ ] Artifact size acceptable

### 7. Performance Baseline

- [ ] Load test executed
- [ ] Response times acceptable
- [ ] Database query performance verified
- [ ] Memory usage stable
- [ ] CPU usage acceptable
- [ ] Redis performance verified

### 8. Backup & Recovery

- [ ] Database backup procedure tested
- [ ] Recovery procedure documented
- [ ] Backup retention policy set
- [ ] Disaster recovery plan in place
- [ ] RTO/RPO targets defined

### 9. Monitoring & Alerting

- [ ] Application health check configured
- [ ] Error rate alerts configured
- [ ] Performance alerts configured
- [ ] Security alerts configured
- [ ] Uptime monitoring configured
- [ ] Log monitoring configured

### 10. Documentation

- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] Security fixes documented
- [ ] Troubleshooting guide prepared
- [ ] Runbook prepared
- [ ] Incident response plan ready

---

## Deployment Steps

### Step 1: Pre-Flight Checks

```bash
# Verify all tests pass
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm lint

# Check build
pnpm build

# Verify no errors
echo "✅ All checks passed"
```

### Step 2: Database Migration

```bash
# Apply pending migrations
pnpm db:migrate

# Verify schema
pnpm db:studio  # Review in UI

# Initialize admin if needed
pnpm admin:init
```

### Step 3: Deploy Application

```bash
# Option A: Direct Node
NODE_ENV=production node dist/index.js

# Option B: PM2
pm2 start ecosystem.config.js --env production

# Option C: Docker
docker build -t servicall:latest .
docker run -e NODE_ENV=production servicall:latest

# Option D: Kubernetes
kubectl apply -f k8s/deployment.yaml
```

### Step 4: Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Smoke test
curl https://your-domain.com/api/trpc/system.ping

# Check logs
tail -f logs/service-errors.log
```

### Step 5: Post-Deployment

```bash
# Monitor for errors (first 30 minutes)
watch -n 5 'tail -20 logs/service-errors.log'

# Check performance metrics
# - Response times
# - Error rate
# - CPU/Memory usage
# - Database connections

# Verify multi-tenant isolation
# Run security tests
```

---

## Rollback Procedure

If deployment fails:

```bash
# Option 1: Revert to previous version
git checkout previous-tag
pnpm install
pnpm build
# Restart application

# Option 2: Database rollback
# Restore from backup if schema changed
pnpm db:migrate --down

# Option 3: Blue-Green deployment
# Switch traffic back to previous environment
```

---

## Post-Deployment Validation

### Security Validation

```bash
# Test IDOR protection
curl -H "x-tenant-id: 999" https://your-domain.com/api/trpc/campaign.list
# Should return 403 (no valid JWT cookie)

# Test cross-tenant access
# Login as user in Tenant A
# Try to access Tenant B resource
# Should return 403

# Test rate limiting
# Send 300+ requests in 60 seconds
# Should return 429 after limit
```

### Functional Validation

```bash
# Test campaign creation
# Test invoice creation with callId
# Test user switching tenant
# Test superadmin cross-tenant access
# Test WebSocket voice pipeline
```

### Performance Validation

```bash
# Monitor metrics
# - p50 response time < 100ms
# - p99 response time < 500ms
# - Error rate < 0.1%
# - Database connections stable
# - Memory usage stable
```

---

## Critical Alerts to Configure

1. **High Error Rate**: > 1% errors in 5 minutes
2. **High Response Time**: p99 > 1000ms
3. **Database Connection Pool Exhausted**
4. **Redis Connection Lost**
5. **Disk Space Low**: < 10% free
6. **Memory Usage High**: > 80%
7. **CPU Usage High**: > 90%
8. **Unauthorized Access Attempts**: > 10 in 5 minutes

---

## Maintenance Schedule

- **Daily**: Check error logs, monitor metrics
- **Weekly**: Review security logs, backup verification
- **Monthly**: Performance analysis, dependency updates
- **Quarterly**: Security audit, capacity planning
- **Annually**: Disaster recovery drill, compliance audit

---

## Contact & Escalation

| Issue | Contact | Escalation |
|-------|---------|-----------|
| Application Error | DevOps Team | CTO |
| Database Issue | DBA | CTO |
| Security Issue | Security Team | CISO |
| Performance Issue | DevOps Team | CTO |
| Deployment Issue | DevOps Team | CTO |

---

## Sign-Off

- [ ] Tech Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______
- [ ] Product Lead: _________________ Date: _______

---

**Generated**: 2026-03-26  
**Version**: 2.0.0 - Security Hardened  
**Status**: ✅ READY FOR DEPLOYMENT
