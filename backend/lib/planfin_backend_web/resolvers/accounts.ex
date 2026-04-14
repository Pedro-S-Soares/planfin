defmodule PlanfinBackendWeb.Resolvers.Accounts do
  alias PlanfinBackend.Accounts

  def me(_parent, _args, %{context: %{current_user: user}}), do: {:ok, user}
  def me(_parent, _args, _context), do: {:error, "Not authenticated"}

  def register_user(_parent, args, _context) do
    case Accounts.register_user(args) do
      {:ok, user} ->
        token = Accounts.generate_user_api_token(user)
        {:ok, %{token: token, user: user}}

      {:error, changeset} ->
        {:error, format_errors(changeset)}
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

  def forgot_password(_parent, %{email: email}, _context) do
    if user = Accounts.get_user_by_email(email) do
      Accounts.deliver_user_reset_password_instructions(
        user,
        fn token -> "planfin://reset-password/#{token}" end
      )
    end

    # Always return true to avoid email enumeration
    {:ok, true}
  end

  def reset_password(_parent, %{token: token, password: password, password_confirmation: confirmation}, _context) do
    with {:ok, user} <- Accounts.get_user_by_reset_password_token(token),
         {:ok, _user} <- Accounts.reset_user_password(user, %{password: password, password_confirmation: confirmation}) do
      {:ok, true}
    else
      _ -> {:error, "Invalid or expired token"}
    end
  end

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
