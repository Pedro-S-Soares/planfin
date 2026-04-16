# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :planfin_backend, :scopes,
  user: [
    default: true,
    module: PlanfinBackend.Accounts.Scope,
    assign_key: :current_scope,
    access_path: [:user, :id],
    schema_key: :user_id,
    schema_type: :id,
    schema_table: :users,
    test_data_fixture: PlanfinBackend.AccountsFixtures,
    test_setup_helper: :register_and_log_in_user
  ]

config :planfin_backend,
  ecto_repos: [PlanfinBackend.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configure the endpoint
config :planfin_backend, PlanfinBackendWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: PlanfinBackendWeb.ErrorHTML, json: PlanfinBackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: PlanfinBackend.PubSub,
  live_view: [signing_salt: "3SK+SBzO"]

# Configure the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# Production uses Swoosh.Adapters.Resend, configured in config/runtime.exs.
config :planfin_backend, PlanfinBackend.Mailer, adapter: Swoosh.Adapters.Local

# Defaults for dev/test; overridden in runtime.exs for prod.
config :planfin_backend,
  mail_from: "Planfin <no-reply@localhost>",
  app_url: "http://localhost:8081"

# Configure Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
