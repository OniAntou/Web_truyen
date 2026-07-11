# Production Remediation Design

## Goal

Make the currently deployed ComicVerse application reachable through the intended public hostname and remove the payment, upload, session, bot-secret, and CI risks found in the production review.

## Deployment and domain

The Vercel project `webtruyen` is the source of truth for the current `Client` application. The legacy `webtruyen.vercel.app` deployment must be detached from its old application and assigned to this project. Production Deployment Protection must be disabled for this public site. The backend's `ALLOWED_ORIGINS` and `CLIENT_URL` must contain the resulting public frontend origin before the frontend is promoted.

The verification sequence is: deploy the client project, request the public hostname in an unauthenticated browser, verify the client calls the current backend rather than a localhost URL, then verify `/api/health` and `/api/ready` remain healthy.

## Authentication and bot credentials

The browser client will rely on the existing `httpOnly` session cookies and will stop writing JWTs to local storage. Backend login responses remain compatible with the scraper bot's bearer-token client, but browser code does not persist or reuse token response fields.

The production test script containing a literal bot password will be removed or changed to use mandatory environment variables. The existing bot account password must be rotated in the deployed user database after the source credential is removed; no credential value will be committed or printed.

## Payment integrity

Payment creation will use a cryptographically random order ID rather than a millisecond timestamp. VNPay return and IPN processing will share one settlement function that atomically changes a pending payment and credits the corresponding user in a MongoDB transaction. A payment already settled is idempotent and never adds coins a second time. If the credit cannot be committed, the payment remains pending so the signed gateway retry can safely settle it later.

## Upload integrity and serverless constraints

The serverless execution limit is the source of truth; the misleading five-minute Express timeout will be removed. Client batching will stay below Vercel's request-body threshold and will surface a clear retryable failure when one batch exceeds the function duration.

The `pages` collection will enforce unique `(chapter_id, page_number)` values. The backend will write page records and their upload metadata transactionally after R2 uploads, clean up newly created R2 objects when the database phase fails, and retry a page-number collision rather than silently storing duplicate positions.

## Test and CI coverage

Backend regression tests will cover payment settlement idempotency, order ID uniqueness, browser-session token handling, page-number invariants, and upload failure cleanup boundaries. CI will add a bot job running `npm ci`, `npm run build`, and high-severity audit. The existing frontend and backend quality gates remain required.

## Non-goals

- Replacing VNPay or changing its business exchange rate.
- Rewriting the scraper's source-site logic.
- Migrating from cookie authentication to a different identity provider.
- Changing creator permissions that were explicitly retained by the project owner.

## Release and rollback

Each remediation commit is verified locally and through a Vercel Preview. The public-domain reassignment occurs only after preview succeeds. If the production frontend fails its unauthenticated smoke test, the prior Vercel deployment remains the rollback candidate. Backend health and readiness are checked after every production deploy.
