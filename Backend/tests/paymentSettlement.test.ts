import assert from "node:assert/strict";
import test from "node:test";
import { coinsForPayment, createPaymentOrderId } from "../src/services/paymentSettlement";

test("payment order IDs are collision-resistant", () => {
  const first = createPaymentOrderId();
  const second = createPaymentOrderId();

  assert.match(first, /^PAY_[0-9a-f]{32}$/);
  assert.notEqual(first, second);
});

test("coin conversion only credits complete thousand-VND units", () => {
  assert.equal(coinsForPayment(5_999), 500);
  assert.equal(coinsForPayment(5_000), 500);
});
