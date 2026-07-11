# Production runbook

This repository is ready for a controlled production deployment after the external services below are configured and the smoke checks pass. It does not include real credentials, provider backup policies, or deployment approvals.

## Deployment layout

- Deploy `Client` and `Backend` as separate Vercel projects.
- Set the client API base URL to the production backend URL before deploying the client.
- Configure all values from `Backend/.env.example` in the Backend project's **Production** environment. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are optional; the application falls back to per-instance memory cache when they are absent.
- Use distinct credentials and URLs for Preview and Production. Never expose backend secrets as `VITE_*` variables.

## Required production services

| Service | Required check |
| --- | --- |
| MongoDB Atlas | Connection string points to a replica set; application user has least-privilege access; automated backups and a periodic restore drill are enabled. |
| Cloudflare R2 | Bucket exists, key has scoped bucket access, CORS permits the production client origin, and lifecycle/retention policy is documented. |
| VNPay | Production merchant credentials are active; return URL is the public client URL; payment callback is verified with a real low-value transaction. |
| SMTP | Password-reset mail is delivered from the configured sender domain. |
| Vercel Cron | `CRON_SECRET` is set in Vercel and the weekly reset endpoint is invoked with `Authorization: Bearer <CRON_SECRET>`. |

## Release procedure

1. Protect `main`: require the two GitHub Actions checks in `.github/workflows/ci.yml` and at least one review.
2. Add Production variables in Vercel. The backend continues to serve liveness traffic, while `/api/ready` returns `503` and lists only the missing variable names when production configuration is incomplete.
3. Deploy Backend first. Confirm `GET /api/health` returns `200` and `GET /api/ready` returns `200` with `database: ok`.
4. Deploy Client, then verify sign-in, protected creator actions, one upload, reading a chapter, and the VNPay return path.
5. Check Vercel runtime logs for a request ID after an intentional invalid request. Support requests should include the `X-Request-Id` response header.
6. Record deployment version, database backup status, and smoke-check result in the release log.

## Operational notes

- `/api/health` is a liveness endpoint and does not require MongoDB. `/api/ready` validates the database connection and reports storage/cache configuration.
- Wallet chapter unlocks use MongoDB transactions; a standalone MongoDB deployment is not supported for production.
- The in-memory cache is safe only as a development fallback. Configure Upstash Redis for consistent cache behavior across serverless instances.
- Keep Vercel, Atlas, R2, VNPay and SMTP credentials in their respective secret managers; rotate them on staff changes or suspected exposure.
