import assert from "node:assert/strict";
import test from "node:test";
import { contentSecurityPolicy } from "../src/config/securityHeaders";

test("content security policy disallows inline scripts and insecure network origins", () => {
  assert.deepEqual(contentSecurityPolicy.directives.scriptSrc, ["'self'"]);
  assert.deepEqual(contentSecurityPolicy.directives.imgSrc, ["'self'", "data:", "blob:", "https:"]);
  assert.deepEqual(contentSecurityPolicy.directives.connectSrc, ["'self'", "https:"]);
});
