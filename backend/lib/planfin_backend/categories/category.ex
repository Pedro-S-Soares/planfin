defmodule PlanfinBackend.Categories.Category do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :integer

  schema "categories" do
    field :name, :string
    belongs_to :user, PlanfinBackend.Accounts.User
    has_many :subcategories, PlanfinBackend.Categories.Subcategory

    timestamps()
  end

  @doc """
  Changeset for creating or updating a category.
  """
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:name, :user_id])
    |> validate_required([:name])
    |> validate_length(:name, min: 1)
  end
end
