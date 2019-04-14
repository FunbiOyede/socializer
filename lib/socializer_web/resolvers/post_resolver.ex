defmodule SocializerWeb.Resolvers.PostResolver do
  alias Socializer.Post

  def list(_parent, _args, _resolutions) do
    {:ok, Post.all()}
  end

  def show(_parent, args, _resolutions) do
    {:ok, Post.find(args[:id])}
  end

  def create(_parent, args, %{
        context: %{current_user: current_user}
      }) do
    args
    |> Map.put(:user_id, current_user.id)
    |> Post.create()
    |> case do
      {:ok, post} ->
        {:ok, post}

      {:error, changeset} ->
        {:error, extract_error_msg(changeset)}
    end
  end

  def create(_parent, _args, _resolutions) do
    {:error, "Unauthenticated"}
  end

  defp extract_error_msg(changeset) do
    changeset.errors
    |> Enum.map(fn {field, {error, _details}} ->
      String.capitalize(to_string(field)) <> " " <> error
    end)
    |> Enum.join("; ")
  end
end
