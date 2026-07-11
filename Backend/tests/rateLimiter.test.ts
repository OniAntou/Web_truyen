import assert from "node:assert/strict";
import test from "node:test";
import { ipKeyGenerator } from "express-rate-limit";
import { getRateLimitKey } from "../src/middleware/rateLimiter";

test("rate limiter uses express-rate-limit's IPv6-safe key generator", () => {
  const ipv6Address = "2001:db8:abcd:12::1";
  assert.equal(getRateLimitKey(ipv6Address), ipKeyGenerator(ipv6Address));
});

test("rate limiter uses a safe fallback when Express has no client IP", () => {
  assert.equal(getRateLimitKey(undefined), ipKeyGenerator("0.0.0.0"));
});
