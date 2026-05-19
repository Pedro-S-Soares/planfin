defmodule PlanfinBackend.Categories.Subcategory do
  use Ecto.Schema
  import Ecto.Changeset

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Categories.Category

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "subcategories" do
    field :name, :string
    field :type, :string, default: "expense"
    belongs_to :category, PlanfinBackend.Categories.Category

    timestamps()
  end

  @doc """
  Changeset for creating or updating a subcategory.
  """
  def changeset(subcategory, attrs) do
    subcategory
    |> cast(attrs, [:name, :type, :category_id])
    |> validate_required([:name, :category_id])
    |> validate_length(:name, min: 1)
    |> validate_inclusion(:type, ["expense", "income"])
    |> validate_type_matches_category()
  end

  defp validate_type_matches_category(changeset) do
    category_id = get_field(changeset, :category_id)
    subcategory_type = get_field(changeset, :type)

    if category_id && subcategory_type do
      case Repo.get(Category, category_id) do
        nil ->
          changeset

        category ->
          if category.type != subcategory_type do
            add_error(changeset, :type, "must match parent category type (#{category.type})")
          else
            changeset
          end
      end
    else
      changeset
    end
  end
end
