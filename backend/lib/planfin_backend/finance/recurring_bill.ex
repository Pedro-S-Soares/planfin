defmodule PlanfinBackend.Finance.RecurringBill do
  @moduledoc """
  A planned money movement.

    * `direction: "expense"` — a bill (rent, power, subscriptions), paid from
      an account (boleto/Pix) or charged on a card, as chosen by `account_id`.
    * `direction: "income"` — expected money in (e.g. variable income),
      received on an account.

  With `kind: "quota"` an expense is a monthly spending allowance (e.g. R$ 350
  for nails) consumed by several purchases of its subcategory instead of one
  payment. It is never paid nor charged: its purchases are the real entries.

  Recurring items happen every month; with `once_month` the item happens only
  in that month (a one-off boleto or a one-off expected income). Each month
  becomes an occurrence that is pending until a `BillPayment` exists.

  `partner_income` marks the one-off expected income holding the partner's
  salary of a month, typed month by month in the plan.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "recurring_bills" do
    field :name, :string
    field :amount, :decimal
    field :due_day, :integer
    field :active, :boolean, default: true
    field :direction, :string, default: "expense"
    field :once_month, :date
    field :kind, :string, default: "fixed"
    field :partner_income, :boolean, default: false

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :account, PlanfinBackend.Finance.Account
    belongs_to :subcategory, PlanfinBackend.Categories.Subcategory
    has_many :payments, PlanfinBackend.Finance.BillPayment, foreign_key: :bill_id

    timestamps()
  end

  def changeset(bill, attrs) do
    bill
    |> cast(attrs, [
      :name,
      :amount,
      :due_day,
      :active,
      :group_id,
      :account_id,
      :subcategory_id,
      :direction,
      :once_month,
      :kind,
      :partner_income
    ])
    |> update_change(:once_month, &Date.beginning_of_month/1)
    |> update_change(:name, &String.trim/1)
    |> validate_required([:name, :amount, :due_day, :group_id, :account_id])
    |> validate_length(:name, min: 1, max: 60)
    |> validate_number(:amount, greater_than: 0)
    |> validate_number(:due_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 31)
    |> validate_inclusion(:direction, ["expense", "income"])
    |> validate_inclusion(:kind, ["fixed", "quota"])
    |> validate_quota()
  end

  defp validate_quota(changeset) do
    if get_field(changeset, :kind) == "quota" do
      changeset
      |> validate_required([:subcategory_id], message: "a quota needs a subcategory")
      |> validate_inclusion(:direction, ["expense"], message: "a quota must be an expense")
    else
      changeset
    end
  end
end
