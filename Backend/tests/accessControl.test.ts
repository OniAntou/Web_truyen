import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { getZodErrorMessage } from "../src/middleware/validateRequest";
import { canManageComic, isAdmin, isCronAuthorized } from "../src/utils/accessControl";
import { getPagination } from "../src/utils/pagination";

test("only an admin or owning creator can manage a comic", () => {
  assert.equal(canManageComic({ id: "owner", role: "creator" }, "owner"), true);
  assert.equal(canManageComic({ id: "other", role: "creator" }, "owner"), false);
  assert.equal(canManageComic({ id: "owner", role: "user" }, "owner"), false);
  assert.equal(canManageComic({ id: "admin", role: "admin" }, "owner"), true);
  assert.equal(isAdmin({ id: "admin", role: "admin" }), true);
});

test("missing and downgraded principals do not retain creator access", () => {
  assert.equal(canManageComic(undefined, "owner"), false);
  assert.equal(canManageComic({ id: "owner", role: "user" }, "owner"), false);
});

test("cron authorization fails closed when the secret is absent or wrong", () => {
  assert.equal(isCronAuthorized(undefined, undefined), false);
  assert.equal(isCronAuthorized("secret", undefined), false);
  assert.equal(isCronAuthorized("secret", "Bearer wrong"), false);
  assert.equal(isCronAuthorized("secret", "Bearer secret"), true);
});

test("Zod v4 validation errors return their first issue message", () => {
  try {
    z.object({ email: z.string().email() }).parse({ email: "not-an-email" });
    assert.fail("Expected Zod parsing to fail");
  } catch (error) {
    assert.equal(getZodErrorMessage(error), "Invalid email address");
  }
});

test("pagination clamps invalid and oversized client values", () => {
  assert.deepEqual(getPagination("-3", "10000", 20, 100), { page: 1, limit: 100, skip: 0 });
  assert.deepEqual(getPagination("not-a-number", undefined, 20, 100), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(getPagination("3", "15", 20, 100), { page: 3, limit: 15, skip: 30 });
  assert.deepEqual(getPagination("999999", "1", 20, 100), { page: 10000, limit: 1, skip: 9999 });
});
