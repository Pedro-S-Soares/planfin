defmodule PlanfinBackend.Categories do
  @moduledoc """
  The Categories context.
  """

  import Ecto.Query, warn: false
  alias PlanfinBackend.Repo

  alias PlanfinBackend.Categories.{Category, Subcategory}

  @default_categories [
    {"Alimentação", ["Restaurante", "Mercado", "Lanche"]},
    {"Transporte", ["Combustível", "Transporte público", "Aplicativo"]},
    {"Lazer", ["Cinema", "Viagem", "Assinatura"]},
    {"Saúde", ["Farmácia", "Consulta", "Academia"]},
    {"Outros", []}
  ]

  @doc """
  Lists all categories for a given user, with subcategories preloaded.
  """
  def list_categories(user_id) do
    Category
    |> where([c], c.user_id == ^user_id)
    |> preload(:subcategories)
    |> Repo.all()
  end

  @doc """
  Gets a single category by user_id and category_id.
  Raises `Ecto.NoResultsError` if not found or not belonging to the user.
  """
  def get_category!(user_id, category_id) do
    Category
    |> where([c], c.user_id == ^user_id and c.id == ^category_id)
    |> Repo.one!()
  end

  @doc """
  Creates a category for the given user.
  """
  def create_category(user_id, attrs) do
    %Category{}
    |> Category.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert()
  end

  @doc """
  Updates a category.
  """
  def update_category(%Category{} = category, attrs) do
    category
    |> Category.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a category (cascades to subcategories via DB constraint).
  """
  def delete_category(%Category{} = category) do
    Repo.delete(category)
  end

  @doc """
  Creates a subcategory within the given category.
  """
  def create_subcategory(%Category{} = category, attrs) do
    %Subcategory{}
    |> Subcategory.changeset(
      attrs
      |> Map.put(:category_id, category.id)
      |> Map.put(:user_id, category.user_id)
    )
    |> Repo.insert()
  end

  @doc """
  Gets a single subcategory by user_id and subcategory_id.
  Raises `Ecto.NoResultsError` if not found or not belonging to the user.
  """
  def get_subcategory!(user_id, subcategory_id) do
    Subcategory
    |> where([s], s.user_id == ^user_id and s.id == ^subcategory_id)
    |> Repo.one!()
  end

  @doc """
  Updates a subcategory.
  """
  def update_subcategory(%Subcategory{} = subcategory, attrs) do
    subcategory
    |> Subcategory.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a subcategory.
  """
  def delete_subcategory(%Subcategory{} = subcategory) do
    Repo.delete(subcategory)
  end

  @doc """
  Seeds the default categories (with subcategories) for the given user.
  Returns `{:ok, [%Category{subcategories: [...]}]}` on success.
  """
  def seed_default_categories(user_id) do
    results =
      Enum.map(@default_categories, fn {cat_name, sub_names} ->
        {:ok, category} = create_category(user_id, %{name: cat_name})

        subcategories =
          Enum.map(sub_names, fn sub_name ->
            {:ok, sub} = create_subcategory(category, %{name: sub_name})
            sub
          end)

        %{category | subcategories: subcategories}
      end)

    {:ok, results}
  end
end
