import { test } from "node:test";
import assert from "node:assert/strict";
import { allowanceBreakdown } from "./allowance-breakdown";

const open = {
  invoiceStatus: "open",
  planResult: "895.91",
  planUntil: "2026-12-04",
  goalDays: 7,
  goalDaily: "140.00",
  goalAmount: "980.00",
  free: "-84.09",
  cash: "1200.00",
  cashUntil: "2026-12-10",
  capped: false,
};

test("open invoice: the plan, minus the goal until the closing, is what is missing", () => {
  const b = allowanceBreakdown(open, "R$");
  assert.ok(b);
  assert.deepEqual(b.rows, [
    { label: "Livre no plano até 04/12", amount: 895.91 },
    { label: "Meta até lá (7 dias × R$ 140,00)", amount: -980 },
  ]);
  assert.deepEqual(b.total, { label: "Falta", amount: -84.09 });
  assert.equal(b.hasGoal, true);
  assert.equal(b.capNote, null);
  // The lines add up to the total, like an extract.
  const sum = b.rows.reduce((acc, r) => acc + r.amount, 0);
  assert.ok(Math.abs(sum - b.total.amount) < 0.005);
});

test("open invoice with money left: what is left goes to the allowance, capped by the cash", () => {
  const b = allowanceBreakdown(
    { ...open, planResult: "2500.00", free: "1520.00", cash: "900.00", capped: true },
    "R$",
  );
  assert.ok(b);
  assert.deepEqual(b.total, { label: "Sobra para a mesada", amount: 1520 });
  assert.equal(b.capNote, "Limitado ao dinheiro livre na conta até 10/12: R$ 900,00");
});

test("one day of goal reads in the singular; no active goal hides the line", () => {
  const one = allowanceBreakdown({ ...open, goalDays: 1, goalAmount: "140.00", free: "755.91" }, "R$");
  assert.equal(one?.rows[1].label, "Meta até lá (1 dia × R$ 140,00)");

  const none = allowanceBreakdown({ ...open, goalDays: 0, goalDaily: "0", goalAmount: "0", free: "895.91" }, "R$");
  assert.equal(none?.rows.length, 1);
  assert.equal(none?.hasGoal, false);
  assert.deepEqual(none?.total, { label: "Sobra para a mesada", amount: 895.91 });
});

test("closed invoice: one line, the left over until the salary, no goal", () => {
  const closed = {
    invoiceStatus: "closed",
    planResult: "1000.00",
    planUntil: "2027-01-12",
    goalDays: null,
    goalDaily: null,
    goalAmount: null,
    free: "1000.00",
    cash: "3000.00",
    cashUntil: "2026-12-10",
    capped: false,
  };
  const b = allowanceBreakdown(closed, "R$");
  assert.ok(b);
  assert.deepEqual(b.rows, []);
  assert.deepEqual(b.total, { label: "Sobra até o salário de 13/01", amount: 1000 });
  assert.equal(b.hasGoal, false);

  const short = allowanceBreakdown({ ...closed, planResult: "-50.00", free: "-50.00" }, "R$");
  assert.equal(short?.total.label, "Falta até o salário de 13/01");
});

test("without an invoice plan there is nothing to explain", () => {
  assert.equal(allowanceBreakdown({ invoiceStatus: null, free: "0" }, "R$"), null);
});
