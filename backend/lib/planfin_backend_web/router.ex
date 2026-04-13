defmodule PlanfinBackendWeb.Router do
  use PlanfinBackendWeb, :router

  import PlanfinBackendWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {PlanfinBackendWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_scope_for_user
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :graphql do
    plug :accepts, ["json"]
    plug CORSPlug
    plug PlanfinBackendWeb.Plugs.AuthContext
  end

  scope "/", PlanfinBackendWeb do
    pipe_through :browser

    get "/", PageController, :home
  end

  scope "/api" do
    pipe_through :graphql

    forward "/graphql", Absinthe.Plug,
      schema: PlanfinBackendWeb.Schema

    if Mix.env() == :dev do
      forward "/graphiql", Absinthe.Plug.GraphiQL,
        schema: PlanfinBackendWeb.Schema,
        socket: PlanfinBackendWeb.UserSocket,
        interface: :playground
    end
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:planfin_backend, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: PlanfinBackendWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Authentication routes

  scope "/", PlanfinBackendWeb do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    get "/users/register", UserRegistrationController, :new
    post "/users/register", UserRegistrationController, :create
  end

  scope "/", PlanfinBackendWeb do
    pipe_through [:browser, :require_authenticated_user]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm-email/:token", UserSettingsController, :confirm_email
  end

  scope "/", PlanfinBackendWeb do
    pipe_through [:browser]

    get "/users/log-in", UserSessionController, :new
    get "/users/log-in/:token", UserSessionController, :confirm
    post "/users/log-in", UserSessionController, :create
    delete "/users/log-out", UserSessionController, :delete
  end
end
