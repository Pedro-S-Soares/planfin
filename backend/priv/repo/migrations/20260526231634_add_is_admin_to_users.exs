defmodule PlanfinBackend.Repo.Migrations.AddIsAdminToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :is_admin, :boolean, null: false, default: false
    end

    # Mark the owner as admin
    execute(
      "UPDATE users SET is_admin = true WHERE email = 'pedro.soareszl99@gmail.com'",
      "UPDATE users SET is_admin = false WHERE email = 'pedro.soareszl99@gmail.com'"
    )
  end
end
