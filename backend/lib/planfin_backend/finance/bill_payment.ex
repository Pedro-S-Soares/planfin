defmodule PlanfinBackend.Finance.BillPayment do
  @moduledoc "Marks the occurrence of a recurring bill in `month` as paid by `expense`."
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "bill_payments" do
    field :month, :date

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :bill, PlanfinBackend.Finance.RecurringBill
    belongs_to :expense, PlanfinBackend.Expenses.Expense

    timestamps()
  end

  def changeset(payment, attrs) do
    payment
    |> cast(attrs, [:month, :group_id, :bill_id, :expense_id])
    |> validate_required([:month, :group_id, :bill_id, :expense_id])
    |> unique_constraint([:bill_id, :month])
  end
end
