defmodule PlanfinBackendWeb.PageController do
  use PlanfinBackendWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
