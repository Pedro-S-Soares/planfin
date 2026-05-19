# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     PlanfinBackend.Repo.insert!(%PlanfinBackend.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias PlanfinBackend.Repo
alias PlanfinBackend.Groups.Group
alias PlanfinBackend.Categories.Category
alias PlanfinBackend.Categories.Subcategory

# ---------------------------------------------------------------------------
# Category seeds
# ---------------------------------------------------------------------------
# Format: {category_name, [subcategory_names], type}
# Idempotent: skips insert if category/subcategory already exists (get_by check)
# ---------------------------------------------------------------------------

expense_categories = [
  {"Alimentação", ["Restaurante", "Mercado", "Lanche"], "expense"},
  {"Transporte", ["Combustível", "Transporte público", "Aplicativo"], "expense"},
  {"Moradia", ["Aluguel", "Condomínio", "Conta de água", "Conta de luz", "Internet"], "expense"},
  {"Saúde", ["Farmácia", "Consulta", "Plano de saúde"], "expense"},
  {"Lazer", ["Cinema", "Streaming", "Viagem"], "expense"},
  {"Educação", ["Curso", "Livro", "Escola"], "expense"},
  {"Vestuário", ["Roupa", "Calçado", "Acessório"], "expense"},
  {"Outros", [], "expense"}
]

income_categories = [
  {"Salário", ["CLT", "Freelance", "PJ"], "income"},
  {"Investimentos", ["Dividendos", "Rendimento", "Venda"], "income"},
  {"Outros", [], "income"}
]

all_categories = expense_categories ++ income_categories

groups = Repo.all(Group)

Enum.each(groups, fn group ->
  Enum.each(all_categories, fn {cat_name, subcats, type} ->
    category =
      case Repo.get_by(Category, name: cat_name, group_id: group.id, type: type) do
        nil ->
          %Category{}
          |> Category.changeset(%{name: cat_name, group_id: group.id, type: type})
          |> Repo.insert!()

        existing ->
          existing
      end

    Enum.each(subcats, fn sub_name ->
      unless Repo.get_by(Subcategory, name: sub_name, category_id: category.id) do
        %Subcategory{}
        |> Subcategory.changeset(%{name: sub_name, category_id: category.id, type: type})
        |> Repo.insert!()
      end
    end)
  end)
end)

IO.puts(
  "Seeds completed: #{length(groups)} group(s) seeded with #{length(all_categories)} category templates."
)
