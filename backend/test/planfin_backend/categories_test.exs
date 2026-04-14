defmodule PlanfinBackend.CategoriesTest do
  use PlanfinBackend.DataCase

  alias PlanfinBackend.Categories
  alias PlanfinBackend.Categories.{Category, Subcategory}

  import PlanfinBackend.AccountsFixtures

  describe "list_categories/1" do
    test "returns only categories belonging to the given user (isolation)" do
      user1 = user_fixture()
      user2 = user_fixture()

      # Each user already has 5 seeded categories from registration
      user1_categories = Categories.list_categories(user1.id)
      user2_categories = Categories.list_categories(user2.id)

      user1_ids = MapSet.new(user1_categories, & &1.id)
      user2_ids = MapSet.new(user2_categories, & &1.id)

      # No overlap between users' categories
      assert MapSet.disjoint?(user1_ids, user2_ids)
      # Each user should have exactly 5 default categories
      assert length(user1_categories) == 5
      assert length(user2_categories) == 5
    end

    test "returns categories with subcategories preloaded" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "ExtraCategory"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "ExtraSub"})

      result = Categories.list_categories(user.id)
      extra = Enum.find(result, &(&1.name == "ExtraCategory"))

      assert extra != nil
      assert Enum.any?(extra.subcategories, &(&1.id == sub.id))
    end
  end

  describe "create_category/2" do
    test "creates a category with a valid name" do
      user = user_fixture()

      assert {:ok, %Category{name: "Lazer"}} =
               Categories.create_category(user.id, %{name: "Lazer"})
    end

    test "returns error changeset when name is empty" do
      user = user_fixture()

      assert {:error, changeset} = Categories.create_category(user.id, %{name: ""})
      assert %{name: [_ | _]} = errors_on(changeset)
    end

    test "returns error changeset when name is missing" do
      user = user_fixture()

      assert {:error, changeset} = Categories.create_category(user.id, %{})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "get_category!/2" do
    test "returns the category when it belongs to the user" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Saúde"})

      assert %Category{id: id} = Categories.get_category!(user.id, cat.id)
      assert id == cat.id
    end

    test "raises when the category belongs to another user" do
      user1 = user_fixture()
      user2 = user_fixture()
      {:ok, cat} = Categories.create_category(user2.id, %{name: "Saúde"})

      assert_raise Ecto.NoResultsError, fn ->
        Categories.get_category!(user1.id, cat.id)
      end
    end
  end

  describe "update_category/2" do
    test "updates the category name" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Lazer"})

      assert {:ok, %Category{name: "Entretenimento"}} =
               Categories.update_category(cat, %{name: "Entretenimento"})
    end

    test "returns error changeset when new name is empty" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Lazer"})

      assert {:error, changeset} = Categories.update_category(cat, %{name: ""})
      assert %{name: [_ | _]} = errors_on(changeset)
    end
  end

  describe "delete_category/1" do
    test "deletes the category and its subcategories in cascade" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Alimentação"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert {:ok, %Category{}} = Categories.delete_category(cat)

      assert_raise Ecto.NoResultsError, fn ->
        Categories.get_category!(user.id, cat.id)
      end

      refute Repo.get(Subcategory, sub.id)
    end
  end

  describe "create_subcategory/2" do
    test "creates a subcategory associated with the category" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Alimentação"})

      assert {:ok, %Subcategory{name: "Restaurante"}} =
               Categories.create_subcategory(cat, %{name: "Restaurante"})
    end

    test "returns error changeset when name is missing" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Alimentação"})

      assert {:error, changeset} = Categories.create_subcategory(cat, %{})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "get_subcategory!/2" do
    test "returns the subcategory when it belongs to the user" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Alimentação"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert %Subcategory{id: id} = Categories.get_subcategory!(user.id, sub.id)
      assert id == sub.id
    end

    test "raises when subcategory belongs to another user" do
      user1 = user_fixture()
      user2 = user_fixture()
      {:ok, cat2} = Categories.create_category(user2.id, %{name: "Alimentação"})
      {:ok, sub2} = Categories.create_subcategory(cat2, %{name: "Mercado"})

      assert_raise Ecto.NoResultsError, fn ->
        Categories.get_subcategory!(user1.id, sub2.id)
      end
    end
  end

  describe "update_subcategory/2" do
    test "updates the subcategory name" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Alimentação"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert {:ok, %Subcategory{name: "Supermercado"}} =
               Categories.update_subcategory(sub, %{name: "Supermercado"})
    end
  end

  describe "delete_subcategory/1" do
    test "deletes the subcategory" do
      user = user_fixture()
      {:ok, cat} = Categories.create_category(user.id, %{name: "Alimentação"})
      {:ok, sub} = Categories.create_subcategory(cat, %{name: "Mercado"})

      assert {:ok, %Subcategory{}} = Categories.delete_subcategory(sub)
      refute Repo.get(Subcategory, sub.id)
    end
  end

  describe "seed_default_categories/1" do
    test "creates the 5 default categories with their subcategories" do
      user = user_fixture()

      assert {:ok, seeded} = Categories.seed_default_categories(user.id)
      assert length(seeded) == 5

      names = Enum.map(seeded, & &1.name)
      assert "Alimentação" in names
      assert "Transporte" in names
      assert "Lazer" in names
      assert "Saúde" in names
      assert "Outros" in names

      alimentacao = Enum.find(seeded, &(&1.name == "Alimentação"))
      sub_names = Enum.map(alimentacao.subcategories, & &1.name)
      assert "Restaurante" in sub_names
      assert "Mercado" in sub_names
      assert "Lanche" in sub_names

      transporte = Enum.find(seeded, &(&1.name == "Transporte"))
      tsub_names = Enum.map(transporte.subcategories, & &1.name)
      assert "Combustível" in tsub_names
      assert "Transporte público" in tsub_names
      assert "Aplicativo" in tsub_names

      lazer = Enum.find(seeded, &(&1.name == "Lazer"))
      lsub_names = Enum.map(lazer.subcategories, & &1.name)
      assert "Cinema" in lsub_names
      assert "Viagem" in lsub_names
      assert "Assinatura" in lsub_names

      saude = Enum.find(seeded, &(&1.name == "Saúde"))
      ssub_names = Enum.map(saude.subcategories, & &1.name)
      assert "Farmácia" in ssub_names
      assert "Consulta" in ssub_names
      assert "Academia" in ssub_names

      outros = Enum.find(seeded, &(&1.name == "Outros"))
      assert outros.subcategories == []
    end

    test "seed_default_categories is called when register_user succeeds" do
      email = unique_user_email()

      {:ok, user} =
        PlanfinBackend.Accounts.register_user(%{email: email})

      categories = Categories.list_categories(user.id)
      assert length(categories) == 5
    end
  end
end
