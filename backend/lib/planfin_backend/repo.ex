defmodule PlanfinBackend.Repo do
  use Ecto.Repo,
    otp_app: :planfin_backend,
    adapter: Ecto.Adapters.Postgres
end
