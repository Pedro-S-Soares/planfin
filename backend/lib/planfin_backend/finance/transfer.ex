defmodule PlanfinBackend.Finance.Transfer do
  @moduledoc """
  Money moved between two accounts of the same group. Paying a card invoice is a
  transfer from the paying account to the card (`kind: "card_payment"`, with
  `invoice_month` pointing at the invoice being paid).
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @kinds ~w(card_payment allowance reserve other)

  schema "transfers" do
    field :amount, :decimal
    field :date, :date
    field :kind, :string
    field :invoice_month, :date
    field :note, :string

    belongs_to :group, PlanfinBackend.Groups.Group
    belongs_to :created_by, PlanfinBackend.Accounts.User, type: :integer
    belongs_to :from_account, PlanfinBackend.Finance.Account
    belongs_to :to_account, PlanfinBackend.Finance.Account

    timestamps()
  end

  def changeset(transfer, attrs) do
    transfer
    |> cast(attrs, [
      :amount,
      :date,
      :kind,
      :invoice_month,
      :note,
      :group_id,
      :created_by_id,
      :from_account_id,
      :to_account_id
    ])
    |> validate_required([:amount, :date, :kind, :group_id, :from_account_id, :to_account_id])
    |> validate_inclusion(:kind, @kinds)
    |> validate_number(:amount, greater_than: 0)
    |> validate_distinct_accounts()
  end

  defp validate_distinct_accounts(changeset) do
    from = get_field(changeset, :from_account_id)

    if from && from == get_field(changeset, :to_account_id) do
      add_error(changeset, :to_account_id, "must differ from the source account")
    else
      changeset
    end
  end
end
