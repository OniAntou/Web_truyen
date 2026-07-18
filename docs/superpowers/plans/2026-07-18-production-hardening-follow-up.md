# Production Hardening Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the reviewed production security, upload reliability, accessibility, testing, build-artifact, and documentation gaps without changing unrelated application behavior.

**Architecture:** Keep browser authentication cookie-only, make the upload contract match the deployed Vercel Function budget, and add narrow behavior tests around the server-side seams. Client cleanup stays inside entry metadata, home diagnostics, and the affected interactive components; generated output is removed from source control.

**Tech Stack:** React 19, TypeScript, Vite, Express 5, Mongoose, Vercel Functions, Node test runner.

---

## Execution status

Completed on 2026-07-18: Tasks 1 through 4 and all scoped portions of Task 5. Backend strict null-safety is now enabled and the 31 diagnostics across controllers and utility modules were resolved with guards and explicit collection/response types. The separately explicit `noImplicitAny: false` setting remains a legacy compatibility exception; it was not broadened or used to suppress the null-safety migration.

### Task 1: Keep JWTs in HttpOnly cookies only

**Files:**
- Modify: `Backend/src/controllers/authController.ts`
- Modify: `Backend/tests/accessControl.test.ts`

- [ ] Add a failing controller-level behavior test that asserts successful browser auth payloads contain identity data but no `token` field.
- [ ] Run `npm test` from `Backend`; expect the new assertion to fail because login/register/admin login currently serialize `token`.
- [ ] Remove `token` from each JSON response while preserving its cookie and user/admin data.
- [ ] Run `npm test`; expect all backend tests to pass.

### Task 2: Align chapter upload capacity with the Vercel execution budget

**Files:**
- Modify: `Backend/vercel.json`
- Modify: `Backend/src/routes/uploadRoutes.ts`
- Modify: `Backend/src/middleware/upload.ts`
- Modify: `Backend/tests/uploadConfiguration.test.ts`

- [ ] Add a failing configuration test that asserts the function budget is at least the chapter-upload timeout and the request batch is bounded to a safe memory envelope.
- [ ] Run the focused test; expect failure with the current 30-second function limit and five 10-MB in-memory files.
- [ ] Raise the configured Function duration to 300 seconds and make the route timeout match it; reduce each multipart batch to three 8-MB images.
- [ ] Run backend tests and build; expect green results.

### Task 3: Tighten production headers and remove diagnostics

**Files:**
- Modify: `Backend/src/server.ts`
- Modify: `Backend/tests/securityHeaders.test.ts`
- Modify: `Client/src/main.tsx`
- Modify: `Client/src/pages/HomePage.tsx`
- Modify: `Client/src/services/comicService.ts`

- [ ] Add failing tests for a CSP without HTTP origins and without `unsafe-inline` for scripts, plus an absent public `/api/test` route.
- [ ] Make CSP allow only self-hosted scripts, trusted font styles, HTTPS images, and HTTPS connections; remove the public test endpoint.
- [ ] Remove the home-page diagnostic request and redundant `testConnection` client method; retain only the intentional backend warmup.
- [ ] Run backend tests/build and client lint/build; expect green results.

### Task 4: Make reviewed client controls functional and accessible

**Files:**
- Modify: `Client/index.html`
- Modify: `Client/src/router.tsx`
- Modify: `Client/src/layouts/Footer.tsx`
- Modify: `Client/src/features/comic/ComicInfo.tsx`
- Modify: `Client/src/pages/auth/ResetPassword.tsx`

- [ ] Replace Vite metadata with Vietnamese application metadata and an inline SVG favicon that does not require a default Vite asset.
- [ ] Replace placeholder social anchors with non-interactive decorative icons until real URLs are configured.
- [ ] Implement a safe native share action with clipboard fallback and accessible status feedback; make rating controls keyboard-operable buttons.
- [ ] Add labels, names, autocomplete values, inline live feedback, and visible keyboard focus to password-reset controls; make the suspense fallback theme-aware.
- [ ] Run client lint/type-check/build and verify the production-equivalent auth page in a browser.

### Task 5: Strengthen type/test gates and remove generated artifacts

**Files:**
- Modify: `Backend/tsconfig.json`
- Modify: `Backend/src/**/*.ts` as required by strict checking
- Modify: `Client/package.json`
- Modify: `.github/workflows/ci.yml`
- Delete: tracked `Client/dist/index.html`
- Delete: tracked `Client/dist/vite.svg`
- Modify: `README.md`
- Modify: `docs/production-readiness.md`

- [ ] Enable backend strict TypeScript incrementally and resolve resulting diagnostics without suppressions.
- [ ] Add a client test runner and a small high-value UI test set for reset password, rating keyboard control, and sharing fallback; add it to CI.
- [ ] Remove tracked generated files so builds no longer dirty `main`.
- [ ] Update prerequisites, project structure, CI gate count, upload operational constraints, and release checks in documentation.
- [ ] Run all backend, client, and bot quality gates plus `git diff --check`; deploy and smoke-test the affected production paths.
