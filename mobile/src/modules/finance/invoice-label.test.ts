import { test } from "node:test";
import assert from "node:assert/strict";
import { invoiceDueMonth, invoiceMonthLabel } from "./invoice-label";

test("a card due after its closing day names the invoice by the closing month", () => {
  // Closes on the 5th, due on the 15th: the November invoice is due on Nov 15.
  assert.equal(invoiceDueMonth("2026-11", 5, 15), "2026-11");
  assert.equal(invoiceMonthLabel("2026-11", { closingDay: 5, dueDay: 15 }), "Nov/2026");
});

test("a card due before its closing day names the invoice by the next month", () => {
  // Closes on the 25th, due on the 5th: the invoice closing in November is due in December.
  assert.equal(invoiceDueMonth("2026-11", 25, 5), "2026-12");
  assert.equal(invoiceMonthLabel("2026-11", { closingDay: 25, dueDay: 5 }), "Dez/2026");
});

test("due and closing on the same day: the bank's due date is in the next month", () => {
  assert.equal(invoiceDueMonth("2026-11", 10, 10), "2026-12");
});

test("December closings are named after January of the next year", () => {
  assert.equal(invoiceMonthLabel("2026-12", { closingDay: 25, dueDay: 5 }), "Jan/2027");
});

test("without the card's days the key month is shown", () => {
  assert.equal(invoiceMonthLabel("2026-11", null), "Nov/2026");
  assert.equal(invoiceMonthLabel("2026-11", { closingDay: null, dueDay: 5 }), "Nov/2026");
  assert.equal(invoiceMonthLabel(null, { closingDay: 25, dueDay: 5 }), "—");
});
