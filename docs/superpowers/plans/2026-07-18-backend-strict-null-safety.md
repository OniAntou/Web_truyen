# Backend Strict Null-Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable TypeScript strict null-safety for the Backend without changing public API behaviour.

**Architecture:** Keep the existing Mongoose model contracts and add narrow local types or guards at each boundary: environment variables, nullable documents, populated records, and response arrays. Preserve the current explicit `noImplicitAny: false` compatibility setting; its broader legacy migration is separate from the null-safety errors measured in this release.

**Tech Stack:** TypeScript 6, Express 5, Mongoose 9, AWS SDK, Node test runner.

---

## Execution status

Completed on 2026-07-18. `npm exec tsc -- --noEmit`, `npm test`, and `npm run build` all pass after enabling strict null-safety. The intentionally explicit `noImplicitAny: false` compatibility exception remains documented in the production runbook.

### Task 1: Turn on strict null checking and make storage/config access safe

**Files:**
- Modify: `Backend/tsconfig.json`
- Modify: `Backend/src/config/r2.ts`
- Modify: `Backend/src/utils/email.ts`
- Modify: `Backend/src/utils/vnpay.ts`

- [ ] Enable `strict: true` while retaining the separately documented legacy `noImplicitAny: false` override.
- [ ] Guard the R2 client after the existing `R2_ENABLED` check before passing it to AWS SDK methods.
- [ ] Read SMTP/VNPay values into validated local constants before passing them to typed libraries.
- [ ] Run `npm exec tsc -- --noEmit` and expect zero diagnostics.

### Task 2: Guard nullable ownership and populated Mongoose documents

**Files:**
- Modify: `Backend/src/controllers/chapterController.ts`
- Modify: `Backend/src/controllers/comicController.ts`
- Modify: `Backend/src/controllers/adminReportController.ts`
- Modify: `Backend/src/controllers/interactionController.ts`

- [ ] Treat missing `uploader_id`, `comic_id`, and populated targets as unauthorised or absent rather than dereferencing them.
- [ ] Type `userDoc`, report targets, and reading-progress response entries from their inferred Mongo records instead of allowing `null`/empty arrays to infer `never`.
- [ ] Run the backend test suite and expect all tests to pass.

### Task 3: Type local response collections and unknown error paths

**Files:**
- Modify: `Backend/src/controllers/genreController.ts`
- Modify: `Backend/src/controllers/statsController.ts`
- Modify: `Backend/src/middleware/validateRequest.ts`
- Modify: `Backend/src/routes/cronRoutes.ts`
- Modify: `Backend/src/utils/helpers.ts`

- [ ] Give empty response arrays their explicit element types.
- [ ] Narrow caught errors with `instanceof Error` before accessing messages.
- [ ] Type helper arrays/maps and VNPay query values narrowly enough for strict null checks.
- [ ] Run `npm test`, `npm run build`, and `git diff --check`; expect success.

### Task 4: Update documentation and publish

**Files:**
- Modify: `docs/production-readiness.md`
- Modify: `docs/superpowers/plans/2026-07-18-production-hardening-follow-up.md`

- [ ] Record strict null-safety as complete and retain the explicit `noImplicitAny` legacy scope note.
- [ ] Remove or revise any outdated readiness claim found while reviewing these documents.
- [ ] Commit the verified change directly to `main` and confirm the production deployment is READY.
