import assert from "node:assert/strict";
import test from "node:test";
import { Pages } from "../src/models/Pages";
import { canRepairDuplicatePageGroup } from "../scripts/ensure-pages-index";

test("pages require a unique chapter/page-number pair", () => {
  const pageIndex = Pages.schema.indexes().find(([keys]) => (
    keys.chapter_id === 1 && keys.page_number === 1
  ));

  assert.ok(pageIndex);
  assert.equal(pageIndex[1].unique, true);
});

test("only repairs duplicate page groups that reference one image object", () => {
  assert.equal(canRepairDuplicatePageGroup({
    _id: { chapter_id: Pages.schema.path("chapter_id").cast("69b66763f2030f8a3c30a031"), page_number: 1 },
    count: 3,
    page_ids: [],
    image_urls: ["r2:chapters/example/1.webp"],
  }), true);
  assert.equal(canRepairDuplicatePageGroup({
    _id: { chapter_id: Pages.schema.path("chapter_id").cast("69b66763f2030f8a3c30a031"), page_number: 1 },
    count: 2,
    page_ids: [],
    image_urls: ["r2:chapters/example/1.webp", "r2:chapters/example/1-retry.webp"],
  }), false);
});
