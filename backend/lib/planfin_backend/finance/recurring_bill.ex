defmodule PlanfinBackend.Finance.RecurringBill do
  @moduledoc """
  A fixed monthly expense (rent, power, subscriptions). It is paid either from
  an account (boleto/Pix) or charged on a card, as chosen by `account_id`.
  Each month becomes an occurrence that is pending until a `BillPayment` exists.
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

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :account, PlanfinBackend.Finance.Account
    belongs_to :subcategory, PlanfinBackend.Categories.Subcategory
    has_many :payments, PlanfinBackend.Finance.BillPayment, foreign_key: :bill_id

    timestamps()
  end

  def changeset(bill, attrs) do
    bill
    |> cast(attrs, [:name, :amount, :due_day, :active, :group_id, :account_id, :subcategory_id])
    |> update_change(:name, &String.trim/1)
    |> validate_required([:name, :amount, :due_day, :group_id, :account_id])
    |> validate_length(:name, min: 1, max: 60)
    |> validate_number(:amount, greater_than: 0)
    |> validate_number(:due_day, greater_than_or_equal_to: 1, less_than_or_equal_to: 31)
  end
end
