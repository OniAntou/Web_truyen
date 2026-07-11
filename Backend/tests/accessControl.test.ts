import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { getZodErrorMessage } from "../src/middleware/validateRequest";
import { canManageComic, isAdmin, isCronAuthorized } from "../src/utils/accessControl";

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
