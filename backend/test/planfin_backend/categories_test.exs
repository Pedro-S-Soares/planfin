defmodule PlanfinBackend.CategoriesTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.Categories
  alias PlanfinBackend.Categories.{Category, Subcategory}

  import PlanfinBackend.AccountsFixtures

  @default_count 6

  describe "list_categories/1" do
    test "returns only categories belonging to the given group (isolation)" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()

      g1_categories = Categories.list_categories(g1.id)
      g2_categories = Categories.list_categories(g2.id)

      g1_ids = MapSet.new(g1_categories, & &1.id)
      g2_ids = MapSet.new(g2_categories, & &1.id)

      assert MapSet.disjoint?(g1_ids, g2_ids)
      assert length(g1_categories) == @default_count
      assert length(g2_categories) == @default_count
    end

    test "returns categories with subcategories preloaded" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "ExtraCategory"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "ExtraSub"})

      result = Categories.list_categories(group.id)
      extra = Enum.find(result, &(&1.name == "ExtraCategory"))

      assert extra != nil
      assert Enum.any?(extra.subcategories, &(&1.id == sub.id))
    end
  end

  describe "create_category/2" do
    test "creates a category with a valid name" do
      {_user, group} = user_with_group_fixture()

      assert {:ok, %Category{name: "Lazer"}} =
               Categories.create_category(group.id, %{name: "Lazer"})
    end

    test "returns error changeset when name is empty" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} = Categories.create_category(group.id, %{name: ""})
      assert %{name: [_ | _]} = errors_on(changeset)
    end

    test "returns error changeset when name is missing" do
      {_user, group} = user_with_group_fixture()

      assert {:error, changeset} = Categories.create_category(group.id, %{})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "get_category!/2" do
    test "returns the category when it belongs to the group" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Saúde"})

      assert %Category{id: id} = Categories.get_category!(group.id, cat.id)
      assert id == cat.id
    end

    test "raises when the category belongs to another group" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(g2.id, %{name: "Saúde"})

      assert_raise Ecto.NoResultsError, fn ->
        Categories.get_category!(g1.id, cat.id)
      end
    end
  end

  describe "update_category/2" do
    test "updates the category name" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Lazer"})

      assert {:ok, %Category{name: "Entretenimento"}} =
               Categories.update_category(cat, %{name: "Entretenimento"})
    end

    test "returns error changeset when new name is empty" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Lazer"})

      assert {:error, changeset} = Categories.update_category(cat, %{name: ""})
      assert %{name: [_ | _]} = errors_on(changeset)
    end
  end

  describe "delete_category/1" do
    test "deletes the category and its subcategories in cascade" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "Alimentação Extra"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert {:ok, %Category{}} = Categories.delete_category(cat)

      assert_raise Ecto.NoResultsError, fn ->
        Categories.get_category!(group.id, cat.id)
      end

      refute Repo.get(Subcategory, sub.id)
    end
  end

  describe "create_subcategory/2" do
    test "creates a subcategory associated with the category" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "ExtraCat"})

      assert {:ok, %Subcategory{name: "Restaurante"}} =
               Categories.create_subcategory(cat, %{name: "Restaurante"})
    end

    test "returns error changeset when name is missing" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "ExtraCat"})

      assert {:error, changeset} = Categories.create_subcategory(cat, %{})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "get_subcategory!/2" do
    test "returns the subcategory when it belongs to the group" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "ExtraCat"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert %Subcategory{id: id} = Categories.get_subcategory!(group.id, sub.id)
      assert id == sub.id
    end

    test "raises when subcategory belongs to another group" do
      {_u1, g1} = user_with_group_fixture()
      {_u2, g2} = user_with_group_fixture()
      {:ok, cat2} = Categories.create_category(g2.id, %{name: "ExtraCat"})
      {:ok, sub2} = Categories.create_subcategory(cat2, %{name: "Mercado"})

      assert_raise Ecto.NoResultsError, fn ->
        Categories.get_subcategory!(g1.id, sub2.id)
      end
    end
  end

  describe "update_subcategory/2" do
    test "updates the subcategory name" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "ExtraCat"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert {:ok, %Subcategory{name: "Supermercado"}} =
               Categories.update_subcategory(sub, %{name: "Supermercado"})
    end
  end

  describe "delete_subcategory/1" do
    test "deletes the subcategory" do
      {_user, group} = user_with_group_fixture()
      {:ok, cat} = Categories.create_category(group.id, %{name: "ExtraCat"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert {:ok, %Subcategory{}} = Categories.delete_subcategory(sub)
      refute Repo.get(Subcategory, sub.id)
    end
  end

  describe "seed_default_categories/1" do
    test "creates the #{@default_count} default categories with their subcategories" do
      {_user, group} = user_with_group_fixture()

      # The fixture already called seed via Groups.create_group, so we just
      # list them here to verify the seed output.
      seeded = Categories.list_categories(group.id)
      assert length(seeded) == @default_count

      names = Enum.map(seeded, & &1.name)
      assert "Alimentação" in names
      assert "Transporte" in names
      assert "Lazer" in names
      assert "Saúde" in names
      assert "Contas da Casa" in names
      assert "Outros" in names

      alimentacao = Enum.find(seeded, &(&1.name == "Alimentação"))
      sub_names = Enum.map(alimentacao.subcategories, & &1.name)
      assert "Restaurante" in sub_names
      assert "Mercado" in sub_names
      assert "Lanche" in sub_names

      contas = Enum.find(seeded, &(&1.name == "Contas da Casa"))
      csub_names = Enum.map(contas.subcategories, & &1.name)
      assert "Luz" in csub_names
      assert "Água" in csub_names
      assert "Internet" in csub_names
      assert "Aluguel" in csub_names

      outros = Enum.find(seeded, &(&1.name == "Outros"))
      assert outros.subcategories == []
    end

    test "register_user no longer seeds categories (seed now lives on Groups.create_group)" do
      email = unique_user_email()

      {:ok, user} = PlanfinBackend.Accounts.register_user(%{email: email})

      # User has no group yet → no categories
      groups = PlanfinBackend.Groups.list_user_groups(user)
      assert groups == []
    end
  end
end
