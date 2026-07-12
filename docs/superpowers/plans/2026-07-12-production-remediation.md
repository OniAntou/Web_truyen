# Production Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate verified payment, upload, rate-limit, browser-token, bot-secret, and CI reliability risks without changing the working production frontend deployment.

**Architecture:** Keep browser authentication cookie-first: the backend already emits HTTP-only cookies and accepts cookies when no Bearer token is supplied, while bot/API clients remain compatible with the existing response token. Settle a verified VNPay transaction and its coin credit in one MongoDB transaction. Make upload persistence transactional after R2 objects are created, clean those objects on failure, and enforce page-number uniqueness at the database level.

**Tech Stack:** TypeScript, Express, Mongoose/MongoDB Atlas transactions, Cloudflare R2, React/Vite, GitHub Actions, Vercel.

**Implementation status (2026-07-12):** Tasks 1-5 are implemented and locally verified. Before the unique page-number constraint is enforced in Atlas, an operator with the production `MONGO_URI` must run `npm run db:ensure-pages-index` from `Backend`; the script reports existing duplicate pairs and exits without changing data if any are found. When Vercel policy prevents the CLI from reading `MONGO_URI` locally, a one-time production deployment can set `RUN_PAGES_INDEX_MIGRATION=1` as a build environment variable. The build wrapper refuses to run outside Vercel production or without `MONGO_URI`, and normal builds do not run the migration.

---

## File map

- `Backend/src/middleware/rateLimiter.ts` — shared rate-limit key generation.
- `Backend/src/controllers/paymentController.ts` — VNPay order generation and settlement entry points.
- `Backend/src/services/paymentSettlement.ts` — one transaction shared by Return and IPN handlers.
- `Backend/src/controllers/uploadController.ts` — page reservation, database transaction, and R2 rollback.
- `Backend/src/models/Pages.ts` — unique compound page-number index.
- `Backend/scripts/ensure-pages-index.ts` — safe production index preflight and creation.
- `Backend/scripts/maybe-ensure-pages-index.ts` — one-time Vercel-build gate for the page index migration.
- `Client/src/pages/auth/AuthPage.tsx`, `Client/src/pages/admin/AdminLogin.tsx`, and `Client/src/services/apiClient.ts` — stop persisting or sending browser JWTs; keep HTTP-only cookies.
- `Backend/tests/*.test.ts` — regression coverage for pure helpers and production configuration.
- `.github/workflows/ci.yml` — add bot install/build/audit checks.

### Task 1: Make rate limiting IPv6-safe

**Files:**
- Modify: `Backend/src/middleware/rateLimiter.ts`
- Create: `Backend/tests/rateLimiter.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getRateLimitKey } from "../src/middleware/rateLimiter";

test("normalizes IPv6 addresses before using them as rate-limit keys", () => {
  assert.equal(getRateLimitKey("2001:db8:abcd:12::1"), "2001:db8:abcd:12::/56");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/rateLimiter.test.ts`

Expected: import failure because `getRateLimitKey` does not exist.

- [ ] **Step 3: Use express-rate-limit's supported helper**

```ts
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const getRateLimitKey = (ip: string) => ipKeyGenerator(ip || "0.0.0.0");

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { message },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRateLimitKey(req.ip),
});
```

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/rateLimiter.test.ts && npm run build`

Expected: test and backend compilation pass without `ERR_ERL_KEY_GEN_IPV6`.

Commit: `fix: make rate limits IPv6-safe`

### Task 2: Settle payments atomically

**Files:**
- Create: `Backend/src/services/paymentSettlement.ts`
- Modify: `Backend/src/controllers/paymentController.ts`
- Create: `Backend/tests/paymentSettlement.test.ts`

- [ ] **Step 1: Add pure order-ID coverage**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createPaymentOrderId, coinsForPayment } from "../src/services/paymentSettlement";

test("creates collision-resistant VNPay order IDs", () => {
  assert.notEqual(createPaymentOrderId(), createPaymentOrderId());
});

test("converts only complete thousand-VND units to coins", () => {
  assert.equal(coinsForPayment(5999), 500);
});
```

- [ ] **Step 2: Implement the settlement service**

```ts
import crypto from "crypto";
import { Payment, User, mongoose } from "../database";

export const createPaymentOrderId = () => `PAY_${crypto.randomUUID().replaceAll("-", "")}`;
export const coinsForPayment = (amount: number) => Math.floor(amount / 1000) * 100;

export async function settlePayment(orderId: string, responseCode: string, transactionNo?: string) {
  const session = await mongoose.startSession();
  try {
    let result: "settled" | "already-settled" | "not-found" = "not-found";
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ order_id: orderId, status: "pending" }).session(session);
      if (!payment) {
        result = await Payment.exists({ order_id: orderId }).session(session) ? "already-settled" : "not-found";
        return;
      }
      const successful = responseCode === "00";
      payment.status = successful ? "success" : "failed";
      payment.vnp_transaction_no = transactionNo;
      payment.vnp_response_code = responseCode;
      payment.updated_at = new Date();
      await payment.save({ session });
      if (successful) {
        const update = await User.updateOne({ _id: payment.user_id }, { $inc: { coins: coinsForPayment(payment.amount) } }, { session });
        if (update.matchedCount !== 1) throw new Error("Payment user no longer exists");
      }
      result = "settled";
    });
    return result;
  } finally {
    await session.endSession();
  }
}
```

- [ ] **Step 3: Route both signed callbacks through the one service**

Replace both `Payment.findOneAndUpdate(...)` plus `User.findByIdAndUpdate(...)` blocks with `settlePayment(String(orderId), String(responseCode), String(vnp_TransactionNo || ""))`. Return the existing idempotent response when the result is `already-settled`, and return an order-not-found response only for `not-found`.

Replace `const orderId = \`PAY_${Date.now()}\`;` with `const orderId = createPaymentOrderId();`.

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`

Expected: payment helper tests pass; both callbacks compile and share the transaction path.

Commit: `fix: settle payments and wallet credits atomically`

### Task 3: Prevent duplicate pages and orphaned R2 uploads

**Files:**
- Modify: `Backend/src/models/Pages.ts`
- Modify: `Backend/src/controllers/uploadController.ts`
- Create: `Backend/scripts/ensure-pages-index.ts`
- Create: `Backend/tests/pagesIndex.test.ts`

- [ ] **Step 1: Add the schema assertion**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { Pages } from "../src/models/Pages";

test("pages require a unique chapter/page-number pair", () => {
  assert.deepEqual(Pages.schema.indexes(), [[{ chapter_id: 1, page_number: 1 }, { unique: true }]]);
});
```

- [ ] **Step 2: Declare and safely create the unique index**

```ts
PageSchema.index({ chapter_id: 1, page_number: 1 }, { unique: true });
```

`ensure-pages-index.ts` must aggregate duplicate `{ chapter_id, page_number }` pairs first, print their identifiers, and exit non-zero without changing the database when any exist. Only when none exist may it run:

```ts
await Pages.collection.createIndex({ chapter_id: 1, page_number: 1 }, { unique: true, name: "chapter_id_1_page_number_1" });
```

- [ ] **Step 3: Make persistence transactional and compensate R2**

In `uploadChapterPages`, retain every R2 key in `uploadedData`. Start a Mongoose session after the R2 writes, read the current maximum page number inside `session.withTransaction`, and use `Pages.insertMany(pageDocuments, { session })` followed by `Upload.insertMany(uploadDocuments, { session })`. If conversion, R2 upload, page insertion, or upload-record insertion fails, call `deleteFromR2` for every successfully-created R2 key with `Promise.allSettled`, then rethrow the original error.

```ts
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    const last = await Pages.findOne({ chapter_id: chapter._id }).sort({ page_number: -1 }).session(session);
    const pageDocuments = uploadedData.map(({ r2Key }, index) => ({ chapter_id: chapter._id, page_number: (last?.page_number || 0) + index + 1, image_url: r2Key }));
    const pages = await Pages.insertMany(pageDocuments, { session });
    await Upload.insertMany(pages.map((page) => ({ key: page.image_url, type: "page", comic_id: chapter.comic_id, chapter_id: chapter._id, page_number: page.page_number })), { session });
    created = pages;
  });
} catch (error) {
  await Promise.allSettled(uploadedData.map(({ r2Key }) => deleteFromR2(r2Key)));
  throw error;
} finally {
  await session.endSession();
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build`

Expected: index declaration test passes and a failed database transaction cannot leave its newly-uploaded R2 objects behind.

Commit: `fix: make chapter page uploads consistent`

### Task 4: Stop storing browser JWTs in localStorage

**Files:**
- Modify: `Client/src/pages/auth/AuthPage.tsx`
- Modify: `Client/src/pages/admin/AdminLogin.tsx`
- Modify: `Client/src/services/apiClient.ts`
- Modify: `Client/src/utils/authToken.ts`
- Modify: `Client/src/services/authService.ts`

- [ ] **Step 1: Preserve bot compatibility while changing the browser contract**

Keep the backend's existing HTTP-only cookie issuance and token response. The bot can keep using the response token; browser code must not store or send it.

- [ ] **Step 2: Remove browser token persistence and Bearer injection**

In `AuthPage.tsx`, delete `setAuthToken` import and replace:

```ts
setAuthToken(response.token);
storeLogin(response.user);
```

with:

```ts
storeLogin(response.user);
```

In `AdminLogin.tsx`, delete `setAdminToken` import and remove `setAdminToken(data.token);`. In `apiClient.ts`, remove `getAuthToken`/`getAdminToken` imports and the Authorization-header selection block; retain `credentials: "include"` and `X-Requested-With` so the current cookie and CSRF protections continue to work.

Make `authToken.ts` a migration cleanup helper only:

```ts
export const clearAuthToken = () => localStorage.removeItem("authToken");
export const clearAdminToken = () => localStorage.removeItem("adminToken");
```

Update `AuthResponse` so `token` is optional and never consumed by browser UI.

- [ ] **Step 3: Verify and commit**

Run: `npm run lint && npm run build`

Expected: no browser call writes `authToken` or `adminToken`; authenticated requests still use `credentials: "include"`.

Commit: `fix: use HTTP-only cookies for browser auth`

### Task 5: Add bot CI coverage

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add a bot quality gate**

```yaml
  bot:
    name: Bot quality gate
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Backend/bot
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: Backend/bot/package-lock.json
      - run: npm ci
      - run: npm run build
      - run: npm audit --audit-level=high
```

- [ ] **Step 2: Verify and commit**

Run: `npm run build && npm audit --audit-level=high`

Expected: bot compiles and audit has no high-severity findings.

Commit: `ci: verify bot build and dependencies`

### Verification checklist

- [ ] `Backend`: `npm test && npm run build && npm audit --audit-level=high`
- [ ] `Client`: `npm run lint && npm run build` (preserve the pre-existing uncommitted `Client/dist/index.html` artifact)
- [ ] `Backend/bot`: `npm run build && npm audit --audit-level=high`
- [ ] Browser: anonymous homepage and comic-detail flow on `webtruyentranh.vercel.app`
- [ ] Vercel: `/api/health` and `/api/ready` return 200; runtime error clusters stay empty after deployment
- [ ] Git: stage only intentional source, test, workflow, and documentation files; commit directly to `main`; push only after the verification set passes.

### Self-review

- Coverage: payment, uploads, cookies, bot CI, IPv6 rate limiting, and production verification each have an explicit task.
- Exclusions: no CSP rewrite is planned because the observed CSP belongs to API responses rather than the Vite document; no Express five-minute timeout extension is planned because Vercel's 30-second function limit remains authoritative and the client already batches uploads to two files/3.5 MB.
- Exclusion: the hard-coded bot/creator login is an explicit Creator privilege chosen by the repository owner and is not modified by this plan.
