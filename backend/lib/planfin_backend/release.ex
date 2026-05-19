defmodule PlanfinBackend.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """
  @app :planfin_backend

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def seed do
    load_app()

    repo = PlanfinBackend.Repo
    alias PlanfinBackend.Groups.Group
    alias PlanfinBackend.Categories.Category
    alias PlanfinBackend.Categories.Subcategory

    templates = [
      {"Alimentação", ["Restaurante", "Mercado", "Lanche"], "expense"},
      {"Transporte", ["Combustível", "Transporte público", "Aplicativo"], "expense"},
      {"Moradia", ["Aluguel", "Condomínio", "Conta de água", "Conta de luz", "Internet"],
       "expense"},
      {"Saúde", ["Farmácia", "Consulta", "Plano de saúde"], "expense"},
      {"Lazer", ["Cinema", "Streaming", "Viagem"], "expense"},
      {"Educação", ["Curso", "Livro", "Escola"], "expense"},
      {"Vestuário", ["Roupa", "Calçado", "Acessório"], "expense"},
      {"Outros", [], "expense"},
      {"Salário", ["CLT", "Freelance", "PJ"], "income"},
      {"Investimentos", ["Dividendos", "Rendimento", "Venda"], "income"},
      {"Outros", [], "income"}
    ]

    {:ok, _, _} =
      Ecto.Migrator.with_repo(repo, fn r ->
        groups = r.all(Group)

        Enum.each(groups, fn group ->
          Enum.each(templates, fn {cat_name, subcats, type} ->
            category =
              case r.get_by(Category, name: cat_name, group_id: group.id, type: type) do
                nil ->
                  %Category{}
                  |> Category.changeset(%{name: cat_name, group_id: group.id, type: type})
                  |> r.insert!()

                existing ->
                  existing
              end

            Enum.each(subcats, fn sub_name ->
              unless r.get_by(Subcategory, name: sub_name, category_id: category.id) do
                %Subcategory{}
                |> Subcategory.changeset(%{
                  name: sub_name,
                  category_id: category.id,
                  type: type
                })
                |> r.insert!()
              end
            end)
          end)
        end)

        IO.puts("Seed completed for #{length(groups)} group(s).")
      end)
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    # Many platforms require SSL when connecting to the database
    Application.ensure_all_started(:ssl)
    Application.ensure_loaded(@app)
  end
end
