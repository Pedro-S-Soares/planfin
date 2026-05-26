defmodule PlanfinBackend.Repo.Migrations.CreateAllowedUsers do
  use Ecto.Migration

  def change do
    create table(:allowed_users) do
      add :email, :string, null: false
      timestamps(updated_at: false)
    end

    create unique_index(:allowed_users, [:email])

    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    emails = [
      "pedro.soareszl99@gmail.com",
      "pedro.soares@infleet.com.br",
      "anl98@hotmail.com",
      "italo.flor@icloud.com",
      "bia.braganasci2004@gmail.com",
      "gsoaresg@gmail.com"
    ]

    rows = Enum.map(emails, &%{email: &1, inserted_at: now})

    execute(
      fn -> repo().insert_all("allowed_users", rows, on_conflict: :nothing) end,
      fn -> :ok end
    )
  end
end
