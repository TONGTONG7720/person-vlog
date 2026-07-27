# Production operations

This project uses GitHub Flow, GitHub Actions and Vercel CLI deployment. The repository contains no production
credentials, database dump or customer data.

## Branch and commit workflow

- `main`: production. Changes arrive only through a reviewed pull request.
- `develop`: integration and preview environment. Create feature work from here.
- `feature/*`: one focused change, for example `feature/contact-form`.

Use Conventional Commits:

```text
feat(blog): add article search
fix(contact): validate email format
perf(hero): optimize three scene
```

`pnpm install` enables Husky. Before each commit, the local hook runs Prettier validation, ESLint and TypeScript.
GitHub branch protection should require the `CI / Quality and build` status before merge and disable direct pushes to
`main`.

## Environments and secrets

Keep Development, Preview and Production isolated. In particular, a Preview deployment must never use the
Production `DATABASE_URL`.

| Location               | Required values                                                                             | Purpose                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Local `.env.local`     | `NEXT_PUBLIC_SITE_URL`, optional local `DATABASE_URL`, CMS auth variables                   | Development only                               |
| Vercel Preview         | Preview `NEXT_PUBLIC_SITE_URL`, separate preview database/auth variables when CMS is tested | Pull-request validation                        |
| Vercel Production      | Production site URL, production database/auth/contact/AI values                             | Live site                                      |
| GitHub Actions secrets | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, Production `DATABASE_URL`             | CLI deployment and production Prisma migration |

Configure service secrets in Vercel, not in source code:

```text
DATABASE_URL=
AUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
OPENAI_API_KEY=                 # only when AI_PROVIDER=openai
ANTHROPIC_API_KEY=              # only when AI_PROVIDER=anthropic
AI_API_KEY=                     # only for an authenticated compatible provider
RESEND_API_KEY=
CONTACT_EMAIL=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

`NEXT_PUBLIC_*` variables are public by design. Do not place API keys, a database URL, admin password or Sentry
auth token behind that prefix. The source-map token is optional: builds work without it, but source maps are not
uploaded to Sentry.

## CI and deployment

`.github/workflows/ci.yml` runs formatting, lint, TypeScript, Vitest and a production build for pull requests and
pushes to `develop`/`main`.

`.github/workflows/deploy.yml` repeats the required checks before every deployment:

1. Pull request or `develop` push: pull Preview environment variables, build with Vercel CLI and publish a Preview
   URL.
2. `main` push: pull Production Vercel variables, build the deployment artifact, apply committed Prisma migrations
   with the GitHub Production `DATABASE_URL`, then deploy the already-built artifact.

The Actions workflow is the deployment authority. After configuring it, do not also enable automatic Vercel Git
deployments for the same repository, otherwise every push can create a duplicate deployment. The Vercel CLI uses
the documented `vercel pull` → `vercel build` → `vercel deploy --prebuilt` flow.

Fork pull requests still run CI, but the deploy job is intentionally skipped because GitHub does not expose
repository secrets to untrusted forks.

## Prisma migration and backup policy

Create migrations only in Development:

```bash
pnpm prisma:migrate -- --name describe_the_change
```

Commit the generated folder in `prisma/migrations`. Production uses only:

```bash
pnpm prisma:deploy
```

Never use `prisma migrate dev`, `db push` or direct schema edits against Production. Make schema changes forward
compatible: add nullable fields first, deploy code that supports both shapes, backfill separately, then tighten
constraints in a later migration.

For Supabase/PostgreSQL, enable provider-managed automated backups and point-in-time recovery where available.
Additionally schedule an encrypted, access-controlled database export outside this repository. Backups must cover
users, projects, posts, messages, knowledge, media metadata, settings and analytics events. Test restoration in a
non-production database before relying on a backup policy.

## Enterprise platform operations

Enterprise private deployment, migration order, SSO secret boundaries, API Gateway limits, backup/recovery and compliance
controls are documented in [enterprise-operations.md](./enterprise-operations.md). The included Docker Compose file is a
private-deployment baseline, not a claim of a multi-region or certified compliance environment.

## Rollback

1. If a web release is unhealthy, use the Vercel dashboard to promote/redeploy the previous successful deployment.
2. Confirm `/` and `/api/health` return healthy responses.
3. Treat database migrations as forward-only. Do not run an ad-hoc destructive rollback in Production. Ship a
   corrective migration, or restore an approved backup to a separate recovery environment first.
4. Record the incident, source commit, deployment URL and follow-up fix in the pull request or issue tracker.

## Monitoring and operational response

- Sentry captures production React/server errors and handled system errors from the structured logger. It redacts
  context keys containing passwords, tokens, API keys, cookies or secrets.
- Vercel Speed Insights is loaded in the root layout. After deployment, enable Web Analytics and Speed Insights in
  the Vercel project dashboard to inspect Core Web Vitals.
- `/api/health` returns `200` with an `ok` status when the site is available, and returns `503` for a detected core
  service failure. It is uncached and safe for external monitors.
- Configure UptimeRobot or Better Uptime to check the home page and `/api/health` every five minutes. Alert the site
  owner on repeated failure; do not put a secret URL in the monitor configuration.
- `/admin/system` shows Website, Database, AI, Email and Monitoring configuration/connectivity. Detailed error
  payloads stay in Sentry, not in CMS.

The APIs emit structured, privacy-preserving log events for Contact persistence, AI model availability, Analytics
persistence and database health. Logs include route, duration and error class only—never form content, chat content,
passwords or credentials.

## Dependency and code security

Dependabot checks npm and GitHub Actions dependencies weekly. The CodeQL workflow scans JavaScript/TypeScript on
pull requests, protected branch pushes and a weekly schedule. In the GitHub repository settings, enable Dependabot
alerts, secret scanning and push protection when those features are available for the repository plan.

## End-to-end smoke tests

Unit tests run with Vitest. A small Playwright suite covers public routes and the health endpoint:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The E2E suite is intentionally lightweight; the normal CI gate validates formatting, lint, types, unit tests and the
production build. Run browser smoke tests before a major design, routing or authentication release.
