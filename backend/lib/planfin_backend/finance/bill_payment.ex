defmodule PlanfinBackend.Finance.BillPayment do
  @moduledoc """
  Settles the occurrence of a recurring bill in `month`. With `expense` it was
  paid (or charged on the card). Without it, the month was skipped by the user
  (`note` says why): it is not owed, not planned and not charged again.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "bill_payments" do
    field :month, :date
    field :note, :string

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :bill, PlanfinBackend.Finance.RecurringBill
    belongs_to :expense, PlanfinBackend.Expenses.Expense

    timestamps()
  end

  def changeset(payment, attrs) do
    payment
    |> cast(attrs, [:month, :group_id, :bill_id, :expense_id, :note])
    |> update_change(:note, &blank_to_nil/1)
    |> validate_length(:note, max: 200)
    |> validate_required([:month, :group_id, :bill_id])
    |> unique_constraint([:bill_id, :month])
  end

  defp blank_to_nil(value) do
    case String.trim(value) do
      "" -> nil
      trimmed -> trimmed
    end
  end
end
