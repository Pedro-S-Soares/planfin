defmodule PlanfinBackend.Finance.QuotaConversion do
  @moduledoc """
  One-time conversion of legacy spending quotas (`per_invoice = false`) to the
  invoice model (CX-79, approved by the owner as an exception to "don't touch old
  expenses", for quotas only).

  For every legacy quota:

    * **Quota row** — `per_invoice` becomes true. Name, amount, account,
      subcategory (kept as metadata), `active` and `inserted_at` stay. On a card
      the month fields change meaning (calendar month → invoice), so a set
      `once_month` / `last_month` M becomes the invoice that covers most of
      calendar month M: M + 1 when the card closes on day 1–15 (that invoice
      takes purchases from day `closing` of M to the eve of the next closing),
      M when it closes on day 16–28. Off a card nothing changes.
    * **Links** (active quotas only, as the legacy rule only counted those) —
      every expense the legacy rule counted gets `quota_id`, where it was null:
      same group and subcategory, type expense, dated in a calendar month the
      quota existed in (from the month of `inserted_at`, up to `last_month`, or
      only `once_month`), whatever its budget flag, source or installment. If two
      legacy quotas share a subcategory and month, the oldest takes it. Nothing
      else of the expense changes.

  Old values go to `quota_conversion_audit` before any change, in the same
  transaction. Idempotent (only legacy quotas and unlinked expenses are
  touched); `revert/1` puts back what a run changed. Plain SQL, so it does not
  depend on later schema changes.
  """

  alias PlanfinBackend.Repo

  @doc "Converts every legacy quota. Returns counts."
  def run(origin \\ "migration") do
    {:ok, counts} = Repo.transaction(fn -> do_run(origin) end)
    counts
  end

  defp do_run(origin) do
    run_at = DateTime.utc_now() |> DateTime.truncate(:second)

    quotas =
      Repo.query!("""
      SELECT b.id, b.active, b.once_month, b.last_month, a.kind, a.closing_day
      FROM recurring_bills b JOIN financial_accounts a ON a.id = b.account_id
      WHERE b.kind = 'quota' AND b.per_invoice = false
      """).rows

    # Links first: they follow the legacy months, read from the rows as they are.
    linked =
      Repo.query!(
        """
        WITH matches AS (
          SELECT DISTINCT ON (e.id) e.id AS expense_id, b.id AS quota_id
          FROM expenses e
          JOIN recurring_bills b
            ON b.group_id = e.group_id AND b.subcategory_id = e.subcategory_id
           AND b.kind = 'quota' AND b.per_invoice = false AND b.active = true
          WHERE e.quota_id IS NULL
            AND e.type = 'expense'
            AND e.date >= date_trunc('month', b.inserted_at)::date
            AND (b.last_month IS NULL OR e.date < (b.last_month + interval '1 month')::date)
            AND (b.once_month IS NULL OR
                 (e.date >= b.once_month AND e.date < (b.once_month + interval '1 month')::date))
          ORDER BY e.id, b.inserted_at, b.id
        ), audited AS (
          INSERT INTO quota_conversion_audit (run_at, origin, entity, entity_id, quota_id)
          SELECT $1, $2, 'expense', expense_id, quota_id FROM matches
        )
        UPDATE expenses AS e SET quota_id = m.quota_id
        FROM matches m WHERE e.id = m.expense_id AND e.quota_id IS NULL
        """,
        [run_at, origin]
      ).num_rows

    Enum.each(quotas, fn [id, _active, once, last, kind, closing] ->
      new_once = invoice_month(once, kind, closing)
      new_last = invoice_month(last, kind, closing)

      Repo.query!(
        """
        INSERT INTO quota_conversion_audit
          (run_at, origin, entity, entity_id, quota_id, old_once_month, new_once_month,
           old_last_month, new_last_month)
        VALUES ($1, $2, 'quota', $3, $3, $4, $5, $6, $7)
        """,
        [run_at, origin, id, once, new_once, last, new_last]
      )

      Repo.query!(
        """
        UPDATE recurring_bills SET per_invoice = true, once_month = $2, last_month = $3
        WHERE id = $1 AND per_invoice = false
        """,
        [id, new_once, new_last]
      )
    end)

    %{quotas: length(quotas), expenses_linked: linked}
  end

  @doc """
  The invoice holding most of calendar month `month` on a card closing on
  `closing`: the next one when it closes on day 1–15, the same one otherwise.
  Off a card (or without a month) it stays as it is.
  """
  def invoice_month(nil, _kind, _closing), do: nil

  def invoice_month(%Date{} = month, "credit_card", closing) when is_integer(closing) do
    if closing <= 15, do: Date.shift(month, month: 1), else: month
  end

  def invoice_month(month, _kind, _closing), do: month

  @doc "Puts back what the runs of `origin` changed (not yet reverted). Returns counts."
  def revert(origin \\ "migration") do
    {:ok, counts} =
      Repo.transaction(fn ->
        now = DateTime.utc_now() |> DateTime.truncate(:second)

        unlinked =
          Repo.query!(
            """
            UPDATE expenses AS e SET quota_id = NULL
            FROM quota_conversion_audit a
            WHERE a.origin = $1 AND a.entity = 'expense' AND a.reverted_at IS NULL
              AND e.id = a.entity_id AND e.quota_id = a.quota_id
            """,
            [origin]
          ).num_rows

        restored =
          Repo.query!(
            """
            UPDATE recurring_bills AS b
            SET per_invoice = false, once_month = a.old_once_month, last_month = a.old_last_month
            FROM quota_conversion_audit a
            WHERE a.origin = $1 AND a.entity = 'quota' AND a.reverted_at IS NULL AND b.id = a.entity_id
            """,
            [origin]
          ).num_rows

        Repo.query!(
          "UPDATE quota_conversion_audit SET reverted_at = $2 WHERE origin = $1 AND reverted_at IS NULL",
          [origin, now]
        )

        %{quotas: restored, expenses_unlinked: unlinked}
      end)

    counts
  end
end
