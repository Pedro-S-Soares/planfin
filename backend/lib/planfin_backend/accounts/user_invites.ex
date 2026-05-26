defmodule PlanfinBackend.Accounts.UserInvites do
  @moduledoc """
  One-time-use invite tokens that allow a new user to register.

  Flow:
  1. Admin calls `generate/1` → gets a UserInvite with a random token.
  2. Admin copies the link and sends it manually.
  3. New user opens the link → calls `redeem/3` with token + email + password.
  4. On success: user is created, email is added to allowed_users, token is marked used.
  """

  import Ecto.Query, warn: false

  alias PlanfinBackend.Repo
  alias PlanfinBackend.Accounts.{User, UserInvite, AllowedUser}

  @token_bytes 32
  @default_ttl_days 7

  @doc "Generates a new invite token. Caller must be admin."
  def generate(user, opts \\ [])

  def generate(%User{is_admin: true} = admin, opts) do
    token = :crypto.strong_rand_bytes(@token_bytes) |> Base.url_encode64(padding: false)

    expires_at =
      case Keyword.get(opts, :expires_in_days, @default_ttl_days) do
        nil -> nil
        days -> DateTime.utc_now(:second) |> DateTime.add(days * 86_400, :second)
      end

    %UserInvite{}
    |> UserInvite.changeset(%{
      token: token,
      invited_by_id: admin.id,
      expires_at: expires_at
    })
    |> Repo.insert()
  end

  def generate(%User{}, _opts), do: {:error, :forbidden}

  @doc """
  Redeems an invite token: creates the user and adds email to allowed_users.

  Returns `{:ok, user}` or `{:error, reason}`.
  """
  def redeem(token, email, password_params) when is_binary(token) do
    Repo.transaction(fn ->
      invite =
        from(i in UserInvite,
          where: i.token == ^token and is_nil(i.used_at) and is_nil(i.revoked_at),
          lock: "FOR UPDATE"
        )
        |> Repo.one()

      cond do
        is_nil(invite) ->
          Repo.rollback(:invalid_token)

        invite.expires_at != nil and
            DateTime.compare(invite.expires_at, DateTime.utc_now(:second)) != :gt ->
          Repo.rollback(:expired)

        true ->
          with {:ok, user} <- create_user(email, password_params),
               {:ok, _} <- add_to_allowlist(email),
               {:ok, _} <- mark_used(invite, email) do
            user
          else
            {:error, reason} -> Repo.rollback(reason)
          end
      end
    end)
  end

  @doc "Revokes an invite. Admin only."
  def revoke(%User{is_admin: true}, %UserInvite{} = invite) do
    if invite.used_at do
      {:error, :already_used}
    else
      invite
      |> UserInvite.changeset(%{revoked_at: DateTime.utc_now(:second)})
      |> Repo.update()
    end
  end

  def revoke(%User{}, _invite), do: {:error, :forbidden}

  @doc "Lists all invites, newest first. Admin only."
  def list_all(%User{is_admin: true}) do
    invites =
      UserInvite
      |> order_by([i], desc: i.inserted_at)
      |> preload(:invited_by)
      |> Repo.all()

    {:ok, invites}
  end

  def list_all(%User{}), do: {:error, :forbidden}

  @doc "Gets a single invite by ID."
  def get(id), do: Repo.get(UserInvite, id)

  # --- Private ---

  defp create_user(email, %{password: password, password_confirmation: confirmation}) do
    PlanfinBackend.Accounts.register_user(%{
      email: email,
      password: password,
      password_confirmation: confirmation
    })
  end

  defp add_to_allowlist(email) do
    %AllowedUser{}
    |> AllowedUser.changeset(%{email: String.downcase(email)})
    |> Repo.insert(on_conflict: :nothing)
  end

  defp mark_used(invite, email) do
    invite
    |> UserInvite.changeset(%{used_by_email: email, used_at: DateTime.utc_now(:second)})
    |> Repo.update()
  end
end
