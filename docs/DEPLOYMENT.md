# Deployment Guide - Ariyadham

**Last Updated:** 2025-11-07
**Status:** Production Ready
**Platform:** Vercel + Supabase

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Environment Variables](#environment-variables)
5. [Deployment Process](#deployment-process)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Database Migrations](#database-migrations)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Ariyadham uses a modern serverless deployment architecture:

- **Frontend & API:** Vercel (Next.js 14)
- **Database:** Supabase (PostgreSQL)
- **CI/CD:** GitHub Actions
- **Region:** Singapore (sin1) - closest to Thailand
- **Domain:** (To be configured)

### Architecture Flow

```
GitHub → GitHub Actions (CI/CD) → Vercel → Production
                                        ↓
                                    Supabase
```

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository**
   - Repository: `Aekanum/ariyadham`
   - Branch: `main` (production), `develop` (staging)

2. **Vercel Account**
   - Organization: Your organization
   - Connected to GitHub repository

3. **Supabase Project**
   - Project URL
   - API Keys (anon key, service role key)
   - Database connection configured

4. **Local Development Tools**
   - Node.js 20+
   - npm 10+
   - Git

---

## Initial Setup

### 1. Vercel Setup

#### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import `Aekanum/ariyadham` repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm ci`

#### Configure Domains (Future)

1. Add custom domain in Vercel project settings
2. Configure DNS records:
   ```
   A     @      76.76.21.21
   CNAME www    cname.vercel-dns.com
   ```

### 2. Supabase Setup

#### Create Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project:
   - **Name:** ariyadham-production
   - **Database Password:** (secure password)
   - **Region:** Southeast Asia (Singapore)

#### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually execute SQL from `migrations/001_create_base_tables.sql` in Supabase SQL Editor.

---

## Environment Variables

### Production (Vercel)

Configure in Vercel Project Settings → Environment Variables:

| Variable                        | Value                          | Environment |
| ------------------------------- | ------------------------------ | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxxxx.supabase.co`    | Production  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key                  | Production  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Your service role key          | Production  |
| `NEXT_PUBLIC_APP_URL`           | `https://ariyadham.vercel.app` | Production  |
| `NODE_ENV`                      | `production`                   | Production  |
| `NEXT_PUBLIC_SENTRY_DSN`        | (optional) Sentry DSN          | Production  |

### Development (Local)

Create `.env.local` file:

```bash
# Copy from example
cp .env.example .env.local

# Edit with your development values
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Staging (Optional)

Create separate Supabase project for staging:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
NEXT_PUBLIC_APP_URL=https://ariyadham-staging.vercel.app
NODE_ENV=staging
```

---

## Deployment Process

### Automatic Deployment (Recommended)

Vercel automatically deploys when you push to GitHub:

#### Production Deployment

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge feature/your-feature

# Push to main
git push origin main
```

GitHub Actions will:

1. Run linting and type checking
2. Build the application
3. Run tests (when configured)
4. Deploy to Vercel production

#### Preview Deployment

Any push to non-main branches creates a preview deployment:

```bash
# Push your branch
git push origin feature/your-feature

# Create pull request
# Preview URL will be posted as PR comment
```

### Manual Deployment

If needed, deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Our CI/CD pipeline (`.github/workflows/ci.yml`) includes:

#### 1. Lint & Type Check

- Runs ESLint
- Runs TypeScript type checking
- Checks code formatting with Prettier

#### 2. Build

- Installs dependencies with `npm ci`
- Builds Next.js application
- Uploads build artifacts

#### 3. Test

- Runs test suite (when configured)
- Runs integration tests

#### 4. Deploy

- **PR branches:** Deploy preview to Vercel
- **Main branch:** Deploy to production

#### 5. Health Check

- Waits 30 seconds after deployment
- Checks `/api/health` endpoint
- Alerts if health check fails

### Pipeline Triggers

- **Push to `main`:** Full pipeline + production deployment
- **Push to `develop`:** Full pipeline + staging deployment
- **Pull Request:** Lint, build, test + preview deployment
- **Push to `claude/**`:\*\* CI checks only

### GitHub Secrets Required

Configure in GitHub Repository Settings → Secrets and Variables → Actions:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

---

## Database Migrations

### Migration Strategy

1. **Development:** Test migrations locally
2. **Staging:** Apply to staging database
3. **Production:** Manual approval required

### Running Migrations

#### Local Development

```bash
# Using Supabase CLI
supabase db reset  # Reset to fresh state
supabase db push   # Apply migrations
```

#### Production

**⚠️ Important:** Production migrations require manual approval.

```bash
# Review migration SQL
cat migrations/001_create_base_tables.sql

# Apply via Supabase Dashboard SQL Editor
# OR use CLI with confirmation
supabase db push --linked
```

### Migration Checklist

Before applying production migrations:

- [ ] Migration tested locally
- [ ] Migration tested on staging
- [ ] Backup created (Supabase auto-backups daily)
- [ ] Migration is reversible (has rollback plan)
- [ ] Team notified of maintenance window
- [ ] Monitored for errors after deployment

### Creating New Migrations

```bash
# Create new migration file
supabase migration new your_migration_name

# Edit the generated SQL file
# migrations/20250107000000_your_migration_name.sql

# Test locally
supabase db reset
```

---

## Monitoring & Health Checks

### Health Check Endpoint

**URL:** `/api/health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-07T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "0.1.0",
  "checks": {
    "api": true,
    "database": true,
    "environment": true
  },
  "errors": [],
  "responseTime": "45ms"
}
```

**Status Codes:**

- `200`: All systems healthy
- `503`: Degraded (some checks failing)

### Monitoring Checklist

- [ ] **Vercel Dashboard:** Monitor deployments
- [ ] **Supabase Dashboard:** Monitor database performance
- [ ] **Health Endpoint:** Check `/api/health` regularly
- [ ] **Sentry (Future):** Error tracking
- [ ] **Google Analytics (Future):** User metrics

### Vercel Analytics

Vercel provides built-in analytics:

1. Go to Vercel project dashboard
2. View metrics:
   - Deployment frequency
   - Build duration
   - Serverless function execution
   - Bandwidth usage

### Performance Metrics

Monitor Core Web Vitals:

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

---

## Rollback Procedures

### Immediate Rollback (Vercel)

If a deployment introduces critical bugs:

#### Via Vercel Dashboard

1. Go to Vercel project → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"
4. Confirm promotion

#### Via Vercel CLI

```bash
# List recent deployments
vercel list

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Rollback Time

- **Vercel rollback:** ~30 seconds
- **DNS propagation:** 5-10 minutes (if domain changed)

### Database Rollback

⚠️ **Database rollbacks are complex and risky.**

1. **Minor issues:** Fix forward with hotfix migration
2. **Major issues:** Restore from Supabase backup
   - Go to Supabase Dashboard → Database → Backups
   - Select backup to restore
   - Confirm restoration (takes 5-10 minutes)

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom:** Vercel build fails

**Causes:**

- TypeScript errors
- Missing environment variables
- Dependency issues

**Solution:**

```bash
# Test build locally
npm run build

# Check types
npm run type-check

# Check environment variables
vercel env pull
```

#### 2. Database Connection Errors

**Symptom:** Health check shows database: false

**Causes:**

- Wrong Supabase URL or keys
- RLS policies blocking queries
- Network issues

**Solution:**

```bash
# Verify environment variables
vercel env ls

# Test database connection locally
npm run dev
# Visit http://localhost:3000/api/health
```

#### 3. Deployment Stuck

**Symptom:** Deployment queued or building for >10 minutes

**Solution:**

- Cancel deployment in Vercel dashboard
- Re-trigger by pushing empty commit:
  ```bash
  git commit --allow-empty -m "Re-trigger deployment"
  git push
  ```

#### 4. Environment Variables Not Updating

**Symptom:** Changed env vars not taking effect

**Solution:**

- Redeploy after changing env vars:
  ```bash
  vercel --prod --force
  ```

### Getting Help

1. **Vercel Support:** [vercel.com/support](https://vercel.com/support)
2. **Supabase Support:** [supabase.com/support](https://supabase.com/support)
3. **GitHub Actions:** Check workflow logs in Actions tab
4. **Team:** Contact development team lead

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Feature flags configured (if applicable)
- [ ] Team notified of deployment

### During Deployment

- [ ] Monitor GitHub Actions workflow
- [ ] Watch Vercel deployment logs
- [ ] Check health endpoint after deployment
- [ ] Verify critical user flows

### Post-Deployment

- [ ] Health check returns 200 OK
- [ ] All critical pages loading
- [ ] Database queries working
- [ ] Authentication working
- [ ] Monitor error rates for 1 hour
- [ ] Update deployment log

---

## Deployment Log Template

Keep a log of production deployments:

```markdown
### Deployment: 2025-11-07 14:30 UTC

**Deployed By:** [Your Name]
**Branch:** main
**Commit:** abc1234
**Version:** 0.2.0

**Changes:**

- Added authentication system
- Fixed database schema
- Updated health check endpoint

**Migration:** None

**Rollback Plan:** Revert to deployment xyz5678

**Status:** ✅ Success
**Health Check:** ✅ Passing
**Issues:** None
```

---

## Security Considerations

### Environment Variables

- ✅ Never commit `.env` files to Git
- ✅ Use Vercel environment variables
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use different keys for dev/staging/prod

### API Security

- ✅ All API routes validate input
- ✅ Authentication required for sensitive endpoints
- ✅ Rate limiting configured
- ✅ CORS properly configured

### Database Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Service role key kept secret
- ✅ Regular backups enabled
- ✅ Database not publicly accessible

---

## Useful Commands

```bash
# Local development
npm run dev              # Start dev server
npm run build            # Test production build
npm run start            # Run production build locally

# Code quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript
npm run format           # Format code

# Deployment
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel logs              # View logs
vercel env pull          # Pull environment variables

# Database
supabase db push         # Apply migrations
supabase db reset        # Reset database
supabase gen types       # Generate TypeScript types

# Health checks
curl https://ariyadham.vercel.app/api/health
curl -I https://ariyadham.vercel.app/api/health  # HEAD request
```

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Document Status:** Complete ✅
**Next Review:** After first production deployment
**Maintained By:** Development Team

🙏 May this deployment serve the dharma well.
