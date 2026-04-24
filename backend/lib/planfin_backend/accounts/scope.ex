defmodule PlanfinBackend.Accounts.Scope do
  @moduledoc """
  Defines the scope of the caller to be used throughout the app.

  The `PlanfinBackend.Accounts.Scope` allows public interfaces to receive
  information about the caller, such as if the call is initiated from an
  end-user, and if so, which user. Additionally, it carries the user's
  currently active group — every domain resource (periods, expenses,
  categories) is scoped by this group.
  """

  alias PlanfinBackend.Accounts.User
  alias PlanfinBackend.Groups.Group

  defstruct user: nil, current_group: nil

  @doc """
  Creates a scope for the given user with no active group yet.
  """
  def for_user(%User{} = user), do: %__MODULE__{user: user}
  def for_user(nil), do: nil

  @doc """
  Returns a scope with the given group set as the current group.
  """
  def with_group(%__MODULE__{} = scope, %Group{} = group) do
    %{scope | current_group: group}
  end

  def with_group(%__MODULE__{} = scope, nil), do: %{scope | current_group: nil}
end
