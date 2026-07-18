import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { uploadLimits } from "../src/middleware/upload";

test("chapter uploads stay within the configured serverless execution and memory budget", () => {
  const vercelConfig = JSON.parse(readFileSync(resolve(__dirname, "../vercel.json"), "utf8"));

  assert.equal(vercelConfig.functions["api/index.js"].maxDuration, 300);
  assert.deepEqual(uploadLimits, {
    fileSize: 8 * 1024 * 1024,
    files: 3,
  });
});
