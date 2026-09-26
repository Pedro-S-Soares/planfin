defmodule PlanfinBackend.Repo.Migrations.AddIconToCategories do
  use Ecto.Migration

  @default_icons [
    {"Alimentação", "food"},
    {"Transporte", "car"},
    {"Lazer", "gamepad-variant"},
    {"Saúde", "heart-pulse"},
    {"Contas da Casa", "home"},
    {"Outros", "dots-horizontal"}
  ]

  def up do
    alter table(:categories) do
      add :icon, :string
    end

    Enum.each(@default_icons, fn {name, icon} ->
      execute("UPDATE categories SET icon = '#{icon}' WHERE name = '#{name}' AND icon IS NULL")
    end)
  end

  def down do
    alter table(:categories) do
      remove :icon
    end
  end
end
