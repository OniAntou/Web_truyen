import assert from "node:assert/strict";
import test from "node:test";
import { Pages } from "../src/models/Pages";

test("pages require a unique chapter/page-number pair", () => {
  const pageIndex = Pages.schema.indexes().find(([keys]) => (
    keys.chapter_id === 1 && keys.page_number === 1
  ));

  assert.ok(pageIndex);
  assert.equal(pageIndex[1].unique, true);
});
