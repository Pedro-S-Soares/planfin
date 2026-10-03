defmodule PlanfinBackend.Finance.Account do
  @moduledoc """
  A money container of the group: a checking account, a credit card, an
  allowance account (owned by one member) or a reserve.

  For non-card accounts the live balance is `balance` (as reconciled at
  `balance_date`) plus every movement after it. Cards carry `closing_day` and
  `due_day` and their state is expressed as invoices (see `Finance.Invoices`).
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @kinds ~w(checking credit_card allowance reserve)

  schema "financial_accounts" do
    field :name, :string
    field :kind, :string
    field :is_primary, :boolean, default: false
    field :balance, :decimal, default: Decimal.new("0")
    field :balance_date, :date
    field :balance_set_at, :naive_datetime
    field :closing_day, :integer
    field :due_day, :integer
    field :archived_at, :naive_datetime

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :owner_user, PlanfinBackend.Accounts.User, type: :integer

    timestamps()
  end

  def kinds, do: @kinds

  def changeset(account, attrs) do
    account
    |> cast(attrs, [
      :name,
      :kind,
      :is_primary,
      :balance,
      :balance_date,
      :balance_set_at,
      :closing_day,
      :due_day,
      :archived_at,
      :group_id,
      :owner_user_id
    ])
    |> update_change(:name, &String.trim/1)
    |> validate_required([:name, :kind, :balance, :balance_date, :balance_set_at, :group_id])
    |> validate_length(:name, min: 1, max: 60)
    |> validate_inclusion(:kind, @kinds)
    |> validate_card_days()
    |> validate_primary_is_checking()
    |> unique_constraint(:is_primary, name: :financial_accounts_one_primary_per_group)
  end

  defp validate_card_days(changeset) do
    if get_field(changeset, :kind) == "credit_card" do
      changeset
      |> validate_required([:closing_day, :due_day])
      |> validate_number(:closing_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 28)
      |> validate_number(:due_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 28)
    else
      changeset
      |> put_change(:closing_day, nil)
      |> put_change(:due_day, nil)
    end
  end

  defp validate_primary_is_checking(changeset) do
    if get_field(changeset, :is_primary) && get_field(changeset, :kind) != "checking" do
      add_error(changeset, :is_primary, "only a checking account can be primary")
    else
      changeset
    end
  end
end
