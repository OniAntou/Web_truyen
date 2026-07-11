import assert from "node:assert/strict";
import test from "node:test";
import { getAllowedOrigins, getProductionEnvironmentIssues } from "../src/config/environment";

test("allowed origins are trimmed and empty entries are removed", () => {
  assert.deepEqual(
    getAllowedOrigins(" https://app.example.com, ,https://admin.example.com "),
    ["https://app.example.com", "https://admin.example.com"],
  );
});

test("production validation identifies missing deployment variables", () => {
  const missing = getProductionEnvironmentIssues({ NODE_ENV: "production" });
  assert.ok(missing.includes("MONGO_URI"));
  assert.ok(missing.includes("CRON_SECRET"));
  assert.ok(missing.includes("R2_BUCKET"));
});

test("non-production environments can use local optional services", () => {
  assert.deepEqual(getProductionEnvironmentIssues({ NODE_ENV: "development" }), []);
});
