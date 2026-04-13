defmodule PlanfinBackend.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PlanfinBackendWeb.Telemetry,
      PlanfinBackend.Repo,
      {DNSCluster, query: Application.get_env(:planfin_backend, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: PlanfinBackend.PubSub},
      # Start a worker by calling: PlanfinBackend.Worker.start_link(arg)
      # {PlanfinBackend.Worker, arg},
      # Start to serve requests, typically the last entry
      PlanfinBackendWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PlanfinBackend.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    PlanfinBackendWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
