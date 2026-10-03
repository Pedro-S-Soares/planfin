defmodule PlanfinBackend.Finance do
  @moduledoc """
  Accounts, balances and transfers of a group.

  Balances are always computed live from the reconciled `balance` of the account
  plus the movements after it, so editing an old entry is reflected at once.
  Card invoices live in `PlanfinBackend.Finance.Invoices`.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Finance.{Account, Transfer}
  alias PlanfinBackend.Expenses.Expense

  # ---- Accounts ----

  @doc "Active (not archived) accounts of the group: primary first, then by kind and name."
  def list_accounts(group_id) do
    Account
    |> where([a], a.group_id == ^group_id and is_nil(a.archived_at))
    |> order_by([a], desc: a.is_primary, asc: a.kind, asc: a.name)
    |> preload(:owner_user)
    |> Repo.all()
  end

  def get_account(group_id, account_id) do
    case Repo.get_by(Account, id: account_id, group_id: group_id) do
      nil -> {:error, :not_found}
      account -> {:ok, Repo.preload(account, :owner_user)}
    end
  end

  def get_primary_account(group_id) do
    Account
    |> where([a], a.group_id == ^group_id and a.is_primary == true and is_nil(a.archived_at))
    |> Repo.one()
  end

  @doc """
  Creates an account. `balance` is the real balance today. The first checking
  account of a group becomes the primary one.
  """
  def create_account(group_id, attrs, today \\ Date.utc_today()) do
    attrs =
      attrs
      |> Map.put(:group_id, group_id)
      |> Map.put_new(:balance, Decimal.new("0"))
      |> Map.put(:balance_date, today)
      |> Map.put(:balance_set_at, now())
      |> maybe_make_primary(group_id)

    %Account{}
    |> Account.changeset(attrs)
    |> Repo.insert()
    |> preload_owner()
  end

  defp maybe_make_primary(%{kind: "checking"} = attrs, group_id) do
    if get_primary_account(group_id), do: attrs, else: Map.put(attrs, :is_primary, true)
  end

  defp maybe_make_primary(attrs, _group_id), do: attrs

  @doc "Updates name, owner and card days. Balance changes go through `set_balance/3`."
  def update_account(%Account{} = account, attrs) do
    account
    |> Account.changeset(
      Map.take(attrs, [:name, :closing_day, :due_day, :owner_user_id, :invoice_goal])
    )
    |> Repo.update()
    |> preload_owner()
  end

  @doc "Makes `account` the group's primary checking account."
  def make_primary(%Account{kind: "checking"} = account) do
    Repo.transaction(fn ->
      Account
      |> where([a], a.group_id == ^account.group_id and a.is_primary == true)
      |> Repo.update_all(set: [is_primary: false])

      account
      |> Account.changeset(%{is_primary: true})
      |> Repo.update!()
      |> Repo.preload(:owner_user, force: true)
    end)
  end

  def make_primary(_account), do: {:error, :not_checking}

  def archive_account(%Account{} = account) do
    account
    |> Ecto.Changeset.change(archived_at: now(), is_primary: false)
    |> Repo.update()
  end

  @doc """
  Reconciles the account with the bank: from now on its balance is `amount`
  plus whatever happens next. Nothing is rewritten, so history stays intact.
  """
  def set_balance(%Account{} = account, %Decimal{} = amount, today \\ Date.utc_today()) do
    account
    |> Account.changeset(%{balance: amount, balance_date: today, balance_set_at: now()})
    |> Repo.update()
    |> preload_owner()
  end

  @doc """
  Live balance of a non-card account on `today`: reconciled balance plus income
  minus spending plus transfers in minus transfers out, counting only
  movements after the reconciliation and dated up to `today`.
  Cards return `nil` (see invoices).
  """
  def account_balance(account, today \\ Date.utc_today())
  def account_balance(%Account{kind: "credit_card"}, _today), do: nil

  def account_balance(%Account{} = account, today) do
    income = sum_entries(account, today, "income")
    spent = sum_entries(account, today, "expense")
    incoming = sum_transfers(account, today, :to_account_id)
    outgoing = sum_transfers(account, today, :from_account_id)

    account.balance
    |> Decimal.add(income)
    |> Decimal.sub(spent)
    |> Decimal.add(incoming)
    |> Decimal.sub(outgoing)
  end

  defp sum_entries(account, today, type) do
    Expense
    |> where([e], e.account_id == ^account.id and e.type == ^type and e.date <= ^today)
    |> after_reconciliation(account)
    |> select([e], sum(e.amount))
    |> Repo.one()
    |> zero_if_nil()
  end

  defp sum_transfers(account, today, field) do
    Transfer
    |> where([t], field(t, ^field) == ^account.id and t.date <= ^today)
    |> after_reconciliation(account)
    |> select([t], sum(t.amount))
    |> Repo.one()
    |> zero_if_nil()
  end

  # A movement is already inside the reconciled balance when it is dated before
  # the reconciliation day, or on that day but recorded before it. Timestamps
  # have second precision, so a movement recorded in the same second as the
  # reconciliation counts as after it.
  defp after_reconciliation(query, %Account{balance_date: date, balance_set_at: set_at}) do
    where(
      query,
      [m],
      m.date > ^date or (m.date == ^date and m.inserted_at >= ^set_at)
    )
  end

  @doc """
  Latest movements of an account (entries and transfers), newest first, each as
  `%{id, kind, date, description, amount}` with `amount` signed from the
  account's point of view.
  """
  def list_movements(%Account{} = account, limit \\ 50) do
    entries =
      Expense
      |> where([e], e.account_id == ^account.id)
      |> order_by([e], desc: e.date, desc: e.inserted_at)
      |> limit(^limit)
      |> preload(:subcategory)
      |> Repo.all()
      |> Enum.map(fn e ->
        sign = if e.type == "income", do: 1, else: -1

        %{
          id: e.id,
          kind: "entry",
          date: e.date,
          inserted_at: e.inserted_at,
          description: entry_description(e),
          amount: Decimal.mult(e.amount, sign)
        }
      end)

    transfers =
      Transfer
      |> where([t], t.from_account_id == ^account.id or t.to_account_id == ^account.id)
      |> order_by([t], desc: t.date, desc: t.inserted_at)
      |> limit(^limit)
      |> preload([:from_account, :to_account])
      |> Repo.all()
      |> Enum.map(fn t ->
        incoming? = t.to_account_id == account.id
        other = if incoming?, do: t.from_account, else: t.to_account

        %{
          id: t.id,
          kind: "transfer",
          date: t.date,
          inserted_at: t.inserted_at,
          description: t.note || transfer_description(t.kind, incoming?, other.name),
          amount: if(incoming?, do: t.amount, else: Decimal.negate(t.amount))
        }
      end)

    (entries ++ transfers)
    |> Enum.sort_by(&{&1.date, &1.inserted_at}, :desc)
    |> Enum.take(limit)
  end

  defp entry_description(%Expense{} = e) do
    base = e.note || (e.subcategory && e.subcategory.name) || "Lançamento"

    if e.installment_count,
      do: "#{base} (#{e.installment_number}/#{e.installment_count})",
      else: base
  end

  defp transfer_description("card_payment", false, other), do: "Pagamento da fatura #{other}"
  defp transfer_description("card_payment", true, other), do: "Pagamento recebido de #{other}"
  defp transfer_description("allowance", _incoming?, other), do: "Mesada · #{other}"
  defp transfer_description("reserve", _incoming?, other), do: "Reserva · #{other}"
  defp transfer_description(_kind, true, other), do: "Transferência de #{other}"
  defp transfer_description(_kind, false, other), do: "Transferência para #{other}"

  # ---- Transfers ----

  @doc "Creates a transfer between two accounts of the group."
  def create_transfer(group_id, created_by_id, attrs) do
    from_id = attrs[:from_account_id]
    to_id = attrs[:to_account_id]

    with {:ok, _from} <- get_account(group_id, from_id),
         {:ok, _to} <- get_account(group_id, to_id) do
      %Transfer{}
      |> Transfer.changeset(
        attrs
        |> Map.put(:group_id, group_id)
        |> Map.put(:created_by_id, created_by_id)
      )
      |> Repo.insert()
    end
  end

  def delete_transfer(group_id, transfer_id) do
    case Repo.get_by(Transfer, id: transfer_id, group_id: group_id) do
      nil -> {:error, :not_found}
      transfer -> Repo.delete(transfer)
    end
  end

  # ---- Helpers ----

  defp preload_owner({:ok, account}), do: {:ok, Repo.preload(account, :owner_user, force: true)}
  defp preload_owner(error), do: error

  defp zero_if_nil(nil), do: Decimal.new("0")
  defp zero_if_nil(value), do: value

  defp now, do: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
end
