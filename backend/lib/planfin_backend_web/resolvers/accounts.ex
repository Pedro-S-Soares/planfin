defmodule PlanfinBackendWeb.Resolvers.Accounts do
  alias PlanfinBackend.Accounts

  @beta_tester_emails [
    "pedro.soareszl99@gmail.com",
    "pedro.soares@infleet.com.br",
    "anl98@hotmail.com",
    "italo.flor@icloud.com",
    "bia.braganasci2004@gmail.com",
    "gsoaresg@gmail.com"
  ]

  def me(_parent, _args, %{context: %{current_user: user}}), do: {:ok, user}
  def me(_parent, _args, _context), do: {:error, "Not authenticated"}

  def update_profile(_parent, args, %{context: %{current_user: user}}) do
    case Accounts.update_user_profile(user, args) do
      {:ok, updated_user} -> {:ok, updated_user}
      {:error, changeset} -> {:error, format_errors(changeset)}
    end
  end

  def update_profile(_parent, _args, _context), do: {:error, "Not authenticated"}

  def register_user(_parent, args, %{remote_ip: ip}) do
    ip_key = :inet.ntoa(ip) |> to_string()

    case PlanfinBackend.RateLimit.check({:register, ip_key}, 5, :timer.hours(1)) do
      {:deny, _} ->
        {:error, "Too many registration attempts. Please try again later."}

      {:allow, _} ->
        case Accounts.register_user(args) do
          {:ok, user} ->
            token = Accounts.generate_user_api_token(user)
            {:ok, %{token: token, user: user}}

          {:error, changeset} ->
            {:error, format_errors(changeset)}
        end
    end
  end

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

  def forgot_password(_parent, %{email: email}, %{remote_ip: ip}) do
    ip_key = :inet.ntoa(ip) |> to_string()

    case PlanfinBackend.RateLimit.check({:forgot_password, ip_key}, 3, :timer.minutes(10)) do
      {:deny, _} ->
        # Still return true to avoid enumeration, but skip the email
        {:ok, true}

      {:allow, _} ->
        if user = Accounts.get_user_by_email(email) do
          app_url = Application.get_env(:planfin_backend, :app_url, "http://localhost:8081")

          Accounts.deliver_user_reset_password_instructions(
            user,
            fn token -> "#{app_url}/reset-password/#{token}" end
          )
        end

        {:ok, true}
    end
  end

  def forgot_password(_parent, %{email: email}, _context) do
    if email in @beta_tester_emails do
      if user = Accounts.get_user_by_email(email) do
        app_url = Application.get_env(:planfin_backend, :app_url, "http://localhost:8081")

        Accounts.deliver_user_reset_password_instructions(
          user,
          fn token -> "#{app_url}/reset-password/#{token}" end
        )
      end
    end

    {:ok, true}
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
