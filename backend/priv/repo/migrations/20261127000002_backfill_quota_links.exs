defmodule PlanfinBackend.Repo.Migrations.BackfillQuotaLinks do
  use Ecto.Migration

  # Until now a purchase belonged to a quota when it had the quota's subcategory:
  # it was saved outside the daily budget and counted as spent in the quota of its
  # calendar month. This links those same purchases explicitly, so every quota keeps
  # the spent amount it showed and no budget total changes (counts_in_budget is not
  # touched).
  #
  # Linked: entries of an active quota's group and subcategory, type expense, outside
  # the budget, typed by hand (no source: not a bill payment, salary, credit or
  # adjustment), not an installment, dated in a month the quota existed (from the
  # month it was created, up to `last_month`, or only `once_month`). When two quotas
  # share a subcategory and month, the oldest one takes it.
  #
  # Idempotent (only rows still without quota) and reversible (down clears exactly
  # the links it made).
  def up do
    execute("""
    UPDATE expenses AS e
    SET quota_id = m.quota_id, quota_backfilled = true
    FROM (
      SELECT DISTINCT ON (x.id) x.id AS expense_id, b.id AS quota_id
      FROM expenses x
      JOIN recurring_bills b
        ON b.group_id = x.group_id
       AND b.subcategory_id = x.subcategory_id
       AND b.kind = 'quota'
       AND b.active = true
      WHERE x.quota_id IS NULL
        AND x.type = 'expense'
        AND x.counts_in_budget = false
        AND x.source IS NULL
        AND x.installment_group_id IS NULL
        AND x.date >= date_trunc('month', b.inserted_at)::date
        AND (b.last_month IS NULL OR x.date < (b.last_month + interval '1 month')::date)
        AND (b.once_month IS NULL OR
             (x.date >= b.once_month AND x.date < (b.once_month + interval '1 month')::date))
      ORDER BY x.id, b.inserted_at, b.id
    ) AS m
    WHERE e.id = m.expense_id
    """)
  end

  def down do
    execute(
      "UPDATE expenses SET quota_id = NULL, quota_backfilled = false WHERE quota_backfilled = true"
    )
  end
end
