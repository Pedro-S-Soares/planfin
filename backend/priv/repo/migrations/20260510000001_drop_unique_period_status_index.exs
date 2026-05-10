defmodule PlanfinBackend.Repo.Migrations.DropUniquePeriodStatusIndex do
  use Ecto.Migration

  def change do
    drop_if_exists index(:periods, [:group_id, :status])
  end
end
