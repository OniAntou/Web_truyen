# API security and reliability hardening

## Scope

Fix the authorization, validation, and configuration failures found in the July 11 review without changing the public API paths or database schema.

## Authorization

- Require authentication and administrator authorization for genre mutation and administrative user deletion.
- Require authentication for report creation and retrieval.
- Restrict comic-cover and chapter-page uploads to admins or the owning creator.
- Resolve the authenticated user's current record on every authenticated request. Reject missing users and use the current database role rather than the role embedded in a seven-day JWT.

## Configuration safety

- Do not accept a known fallback JWT secret. Optional authentication must only verify a token when `JWT_SECRET` is configured.
- Require `CRON_SECRET` for the reset endpoint; deny requests if it is absent or invalid.

## Validation and integrity

- Use the Zod v4 `issues` property so invalid auth payloads produce a controlled 400 response.
- Keep existing response structures and route paths where possible, returning 401/403 for newly protected operations.

## Verification

- Add focused backend tests for route guards, role refresh, invalid Zod payloads, and configuration guards using mocked database dependencies.
- Run backend build/tests and client lint/build.
