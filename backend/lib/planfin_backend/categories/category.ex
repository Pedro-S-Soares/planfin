defmodule PlanfinBackend.Categories.Category do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "categories" do
    field :name, :string
    belongs_to :group, PlanfinBackend.Groups.Group
    has_many :subcategories, PlanfinBackend.Categories.Subcategory

    timestamps()
  end

  @doc """
  Changeset for creating or updating a category.
  """
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:name, :group_id])
    |> validate_required([:name, :group_id])
    |> validate_length(:name, min: 1)
  end
end
