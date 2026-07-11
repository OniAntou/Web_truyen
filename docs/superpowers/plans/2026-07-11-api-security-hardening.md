# API Security and Reliability Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Prevent unauthorized mutations, enforce live account roles, make configuration failures safe, and return controlled validation errors.

**Architecture:** Keep Express paths unchanged. Authentication verifies the JWT and resolves the current \`User\` or \`AdminLogin\`; upload controllers apply a shared ownership predicate before changing a comic or chapter.

**Tech Stack:** TypeScript, Express 5, Mongoose 9, Zod 4, Node test runner through \`tsx\`.

---

## File structure

- Create: \`Backend/src/utils/accessControl.ts\` — typed role and ownership predicates.
- Create: \`Backend/tests/accessControl.test.ts\` — deterministic authorization regression tests.
- Modify: \`Backend/src/middleware/auth.ts\` and \`optionalAuth.ts\` — resolve live JWT principals.
- Modify: \`Backend/src/controllers/uploadController.ts\` — authorize upload targets.
- Modify: \`Backend/src/routes/{genre,user,report,cron,upload}Routes.ts\` — route guards and safe request limits.
- Modify: \`Backend/src/middleware/{upload,validateRequest}.ts\` — multipart and Zod v4 handling.
- Modify: \`Backend/package.json\` — focused test command.

### Task 1: Establish an executable access-control test seam

**Files:**
- Create: \`Backend/src/utils/accessControl.ts\`
- Create: \`Backend/tests/accessControl.test.ts\`
- Modify: \`Backend/package.json\`

- [ ] **Step 1: Write the failing test**

\`\`\`ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { canManageComic, isAdmin } from '../src/utils/accessControl';

test('only an admin or owning creator can manage a comic', () => {
  assert.equal(canManageComic({ id: 'owner', role: 'creator' }, 'owner'), true);
  assert.equal(canManageComic({ id: 'other', role: 'creator' }, 'owner'), false);
  assert.equal(canManageComic({ id: 'owner', role: 'user' }, 'owner'), false);
  assert.equal(canManageComic({ id: 'admin', role: 'admin' }, 'owner'), true);
  assert.equal(isAdmin({ id: 'admin', role: 'admin' }), true);
});
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`npm.cmd test --prefix Backend\`

Expected: FAIL because the module and test script do not exist.

- [ ] **Step 3: Add the smallest reusable implementation**

\`\`\`ts
export type Principal = { id: string; role: 'user' | 'creator' | 'admin' };
export const isAdmin = (principal?: Principal) => principal?.role === 'admin';
export const canManageComic = (principal: Principal | undefined, ownerId: unknown) =>
  isAdmin(principal) || (principal?.role === 'creator' && String(ownerId) === principal.id);
\`\`\`

Add \`"test": "tsx --test tests/*.test.ts"\` to \`Backend/package.json\`.

- [ ] **Step 4: Run the test to verify it passes**

Run: \`npm.cmd test --prefix Backend\`

Expected: PASS with no failures.

- [ ] **Step 5: Commit**

Run: \`git add Backend/package.json Backend/src/utils/accessControl.ts Backend/tests/accessControl.test.ts; git commit -m "test: cover API access control"\`

### Task 2: Resolve current principals and secure routes

**Files:**
- Modify: \`Backend/src/middleware/auth.ts\`
- Modify: \`Backend/src/middleware/optionalAuth.ts\`
- Modify: \`Backend/src/routes/genreRoutes.ts\`
- Modify: \`Backend/src/routes/userRoutes.ts\`
- Modify: \`Backend/src/routes/reportRoutes.ts\`
- Test: \`Backend/tests/accessControl.test.ts\`

- [ ] **Step 1: Extend the failing test**

\`\`\`ts
test('missing and downgraded principals do not retain creator access', () => {
  assert.equal(canManageComic(undefined, 'owner'), false);
  assert.equal(canManageComic({ id: 'owner', role: 'user' }, 'owner'), false);
});
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`npm.cmd test --prefix Backend\`

Expected: FAIL until the case is added.

- [ ] **Step 3: Implement live-principal authentication**

\`\`\`ts
const decoded = jwt.verify(token, secret) as { id: string; role?: string };
const user = await User.findById(decoded.id).select('_id role').lean();
const admin = !user && decoded.role === 'admin'
  ? await AdminLogin.findById(decoded.id).select('_id').lean()
  : null;
if (!user && !admin) return res.status(401).json({ message: 'Tài khoản không còn tồn tại' });
req.user = { id: decoded.id, role: admin ? 'admin' : user!.role };
\`\`\`

Use the resolver in both authentication middlewares. Optional authentication must treat a missing \`JWT_SECRET\` as anonymous rather than verify against \`fallback_secret\`. Add \`authenticateToken, requireAdmin\` to genre mutation and \`DELETE /users/:id\`; retain \`authenticateToken\` for report routes.

- [ ] **Step 4: Run verification**

Run: \`npm.cmd test --prefix Backend; npm.cmd run build --prefix Backend\`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit**

Run: \`git add Backend/src/middleware Backend/src/routes/genreRoutes.ts Backend/src/routes/userRoutes.ts Backend/src/routes/reportRoutes.ts Backend/tests/accessControl.test.ts; git commit -m "fix: enforce live API roles"\`

### Task 3: Enforce upload ownership and multipart limits

**Files:**
- Modify: \`Backend/src/controllers/uploadController.ts\`
- Modify: \`Backend/src/routes/uploadRoutes.ts\`
- Modify: \`Backend/src/middleware/upload.ts\`
- Test: \`Backend/tests/accessControl.test.ts\`

- [ ] **Step 1: Add the ownership regression case**

\`\`\`ts
test('a creator cannot manage another creator comic', () => {
  assert.equal(canManageComic({ id: 'creator-a', role: 'creator' }, 'creator-b'), false);
});
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`npm.cmd test --prefix Backend\`

Expected: FAIL until the case is added.

- [ ] **Step 3: Guard cover and chapter page uploads before processing files**

\`\`\`ts
const comic = await Comic.findById(chapter.comic_id);
if (!comic) throw new AppError('Comic không tồn tại', 404);
if (!canManageComic(req.user, comic.uploader_id)) {
  throw new AppError('Bạn không có quyền chỉnh sửa truyện này.', 403);
}
\`\`\`

For covers, apply the same predicate after loading the requested comic. Limit \`pages\` to five files per request and set \`limits.files: 5\`; the client already batches two images, so its normal flow remains supported.

- [ ] **Step 4: Run verification**

Run: \`npm.cmd test --prefix Backend; npm.cmd run build --prefix Backend\`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit**

Run: \`git add Backend/src/controllers/uploadController.ts Backend/src/routes/uploadRoutes.ts Backend/src/middleware/upload.ts Backend/tests/accessControl.test.ts; git commit -m "fix: restrict comic uploads to owners"\`

### Task 4: Fail closed for cron and Zod validation

**Files:**
- Modify: \`Backend/src/routes/cronRoutes.ts\`
- Modify: \`Backend/src/middleware/validateRequest.ts\`
- Test: \`Backend/tests/accessControl.test.ts\`

- [ ] **Step 1: Add the validation guard test**

\`\`\`ts
test('admin-only check rejects non-admin principals', () => {
  assert.equal(isAdmin({ id: 'user', role: 'user' }), false);
});
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`npm.cmd test --prefix Backend\`

Expected: FAIL until the case is added.

- [ ] **Step 3: Implement safe configuration and Zod handling**

\`\`\`ts
if (!cronSecret) return res.status(503).json({ message: 'CRON_SECRET is not configured' });
if (authHeader !== \`Bearer \${cronSecret}\`) return res.status(401).json({ message: 'Unauthorized' });
\`\`\`

Replace \`error.errors[0].message\` with \`error.issues[0]?.message || 'Dữ liệu không hợp lệ'\` for a \`ZodError\`.

- [ ] **Step 4: Run verification**

Run: \`npm.cmd test --prefix Backend; npm.cmd run build --prefix Backend\`

Expected: all tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit and publish**

Run: \`git add Backend/src/routes/cronRoutes.ts Backend/src/middleware/validateRequest.ts Backend/tests/accessControl.test.ts docs/superpowers; git commit -m "fix: fail closed for cron and validation"; git push origin main\`

### Task 5: Full verification

**Files:**
- Modify: \`docs/superpowers/specs/2026-07-11-api-security-hardening-design.md\`
- Modify: \`docs/superpowers/plans/2026-07-11-api-security-hardening.md\`

- [ ] **Step 1: Inspect the patch**

Run: \`git diff --check; git status --short\`

Expected: no whitespace errors and only hardening changes.

- [ ] **Step 2: Run full verification**

Run: \`npm.cmd test --prefix Backend; npm.cmd run build --prefix Backend; npm.cmd run lint --prefix Client; npm.cmd run build --prefix Client\`

Expected: every command exits 0.
