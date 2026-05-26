defmodule PlanfinBackendWeb.Resolvers.Accounts do
  alias PlanfinBackend.Accounts
  alias PlanfinBackend.Accounts.{BetaTesters, UserInvites}

  def me(_parent, _args, %{context: %{current_user: user}}), do: {:ok, user}
  def me(_parent, _args, _context), do: {:error, "Not authenticated"}

  def update_profile(_parent, args, %{context: %{current_user: user}}) do
    case Accounts.update_user_profile(user, args) do
      {:ok, updated_user} -> {:ok, updated_user}
      {:error, changeset} -> {:error, format_errors(changeset)}
    end
  end

  def update_profile(_parent, _args, _context), do: {:error, "Not authenticated"}

  def register_user(_parent, %{invite_token: token} = args, %{remote_ip: ip}) do
    ip_key = :inet.ntoa(ip) |> to_string()

    case PlanfinBackend.RateLimit.check({:register, ip_key}, 5, :timer.hours(1)) do
      {:deny, _} ->
        {:error, "Too many registration attempts. Please try again later."}

      {:allow, _} ->
        redeem_invite(token, args)
    end
  end

  def register_user(_parent, %{invite_token: token} = args, _context) do
    redeem_invite(token, args)
  end

  defp redeem_invite(token, %{
         email: email,
         password: password,
         password_confirmation: confirmation
       }) do
    case UserInvites.redeem(token, email, %{
           password: password,
           password_confirmation: confirmation
         }) do
      {:ok, user} ->
        api_token = Accounts.generate_user_api_token(user)
        {:ok, %{token: api_token, user: user}}

      {:error, :invalid_token} ->
        {:error, "Convite inválido ou já utilizado."}

      {:error, :expired} ->
        {:error, "Este convite expirou."}

      {:error, changeset} when is_struct(changeset, Ecto.Changeset) ->
        {:error, format_errors(changeset)}

      {:error, _} ->
        {:error, "Não foi possível completar o cadastro."}
    end
  end

  def login(_parent, %{email: email, password: password}, _context) do
    case Accounts.get_user_by_email_and_password(email, password) do
      nil ->
        {:error, "Invalid email or password"}

      user ->
        token = Accounts.generate_user_api_token(user)
        {:ok, %{token: token, user: user}}
    end
  end

  def logout(_parent, _args, %{context: %{current_user: user}}) do
    Accounts.delete_user_api_tokens(user)
    {:ok, true}
  end

  def logout(_parent, _args, _context), do: {:error, "Not authenticated"}

  def forgot_password(_parent, %{email: email}, %{remote_ip: ip}) do
    ip_key = :inet.ntoa(ip) |> to_string()

    case PlanfinBackend.RateLimit.check({:forgot_password, ip_key}, 3, :timer.minutes(10)) do
      {:deny, _} ->
        {:ok, true}

      {:allow, _} ->
        maybe_deliver_reset_password(email)
        {:ok, true}
    end
  end

  def forgot_password(_parent, %{email: email}, _context) do
    maybe_deliver_reset_password(email)
    {:ok, true}
  end

  defp maybe_deliver_reset_password(email) do
    if BetaTesters.allowed?(email) do
      if user = Accounts.get_user_by_email(email) do
        app_url = Application.get_env(:planfin_backend, :app_url, "http://localhost:8081")

        Accounts.deliver_user_reset_password_instructions(
          user,
          fn token -> "#{app_url}/reset-password/#{token}" end
        )
      end
    end
  end

  def reset_password(
        _parent,
        %{token: token, password: password, password_confirmation: confirmation},
        _context
      ) do
    with {:ok, user} <- Accounts.get_user_by_reset_password_token(token),
         {:ok, _user} <-
           Accounts.reset_user_password(user, %{
             password: password,
             password_confirmation: confirmation
           }) do
      {:ok, true}
    else
      _ -> {:error, "Invalid or expired token"}
    end
  end

  def create_invite(_parent, _args, %{context: %{current_user: user}}) do
    case UserInvites.generate(user) do
      {:ok, invite} -> {:ok, invite}
      {:error, :forbidden} -> {:error, "Acesso negado."}
      {:error, changeset} -> {:error, format_errors(changeset)}
    end
  end

  def create_invite(_parent, _args, _context), do: {:error, "Not authenticated"}

  def revoke_invite(_parent, %{id: id}, %{context: %{current_user: user}}) do
    case UserInvites.get(id) do
      nil ->
        {:error, "Convite não encontrado."}

      invite ->
        case UserInvites.revoke(user, invite) do
          {:ok, _} -> {:ok, true}
          {:error, :forbidden} -> {:error, "Acesso negado."}
          {:error, :already_used} -> {:error, "Este convite já foi utilizado."}
        end
    end
  end

  def revoke_invite(_parent, _args, _context), do: {:error, "Not authenticated"}

  def list_invites(_parent, _args, %{context: %{current_user: user}}) do
    case UserInvites.list_all(user) do
      {:ok, invites} -> {:ok, invites}
      {:error, :forbidden} -> {:error, "Acesso negado."}
    end
  end

  def list_invites(_parent, _args, _context), do: {:error, "Not authenticated"}

  defp format_errors(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, val}, acc ->
        String.replace(acc, "%{#{key}}", to_string(val))
      end)
    end)
    |> Enum.map(fn {field, errors} -> "#{field}: #{Enum.join(errors, ", ")}" end)
    |> Enum.join("; ")
  end
end
