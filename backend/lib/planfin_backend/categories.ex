defmodule PlanfinBackend.Categories do
  @moduledoc """
  The Categories context. Categories and subcategories are scoped by group.
  """

  import Ecto.Query, warn: false
  alias PlanfinBackend.Repo

  alias PlanfinBackend.Categories.{Category, Subcategory}

  @default_categories [
    {"Alimentação", ["Restaurante", "Mercado", "Lanche"]},
    {"Transporte", ["Combustível", "Transporte público", "Aplicativo"]},
    {"Lazer", ["Cinema", "Viagem", "Assinatura"]},
    {"Saúde", ["Farmácia", "Consulta", "Academia"]},
    {"Contas da Casa", ["Luz", "Água", "Internet", "Aluguel"]},
    {"Outros", []}
  ]

  @doc """
  Lists all categories for a given group, with subcategories preloaded.
  """
  def list_categories(group_id) do
    Category
    |> where([c], c.group_id == ^group_id)
    |> preload(:subcategories)
    |> Repo.all()
  end

  @doc """
  Gets a single category by group_id and category_id.
  Raises `Ecto.NoResultsError` if not found or not belonging to the group.
  """
  def get_category!(group_id, category_id) do
    Category
    |> where([c], c.group_id == ^group_id and c.id == ^category_id)
    |> Repo.one!()
  end

  @doc """
  Creates a category for the given group.
  """
  def create_category(group_id, attrs) do
    %Category{}
    |> Category.changeset(Map.put(attrs, :group_id, group_id))
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
    |> Subcategory.changeset(Map.put(attrs, :category_id, category.id))
    |> Repo.insert()
  end

  @doc """
  Gets a single subcategory by group_id and subcategory_id (via category).
  Raises `Ecto.NoResultsError` if not found or not belonging to the group.
  """
  def get_subcategory!(group_id, subcategory_id) do
    Subcategory
    |> join(:inner, [s], c in Category, on: c.id == s.category_id)
    |> where([s, c], s.id == ^subcategory_id and c.group_id == ^group_id)
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
  Seeds the default categories (with subcategories) for the given group.
  Returns `{:ok, [%Category{subcategories: [...]}]}` on success.
  """
  def seed_default_categories(group_id) do
    results =
      Enum.map(@default_categories, fn {cat_name, sub_names} ->
        {:ok, category} = create_category(group_id, %{name: cat_name})

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
