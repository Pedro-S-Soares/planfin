defmodule PlanfinBackend.Categories.Subcategory do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "subcategories" do
    field :name, :string
    belongs_to :category, PlanfinBackend.Categories.Category
    belongs_to :user, PlanfinBackend.Accounts.User, type: :integer, foreign_key: :user_id

    timestamps()
  end

  @doc """
  Changeset for creating or updating a subcategory.
  """
  def changeset(subcategory, attrs) do
    subcategory
    |> cast(attrs, [:name, :category_id, :user_id])
    |> validate_required([:name])
    |> validate_length(:name, min: 1)
  end
end
