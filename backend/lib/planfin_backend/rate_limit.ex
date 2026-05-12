defmodule PlanfinBackend.RateLimit do
  use GenServer

  @table :rate_limit_counters
  @cleanup_interval :timer.minutes(10)

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    :ets.new(@table, [:named_table, :public, :set, read_concurrency: true])
    schedule_cleanup()
    {:ok, nil}
  end

  @doc """
  Checks and increments the rate limit counter for `key`.
  Returns {:allow, count} or {:deny, limit}.

  `limit` = max requests in `window_ms` milliseconds (fixed window).
  """
  def check(key, limit, window_ms) do
    now = System.system_time(:millisecond)
    window_start = now - window_ms

    case :ets.lookup(@table, key) do
      [] ->
        :ets.insert(@table, {key, 1, now})
        {:allow, 1}

      [{^key, _count, inserted_at}] when inserted_at < window_start ->
        :ets.insert(@table, {key, 1, now})
        {:allow, 1}

      [{^key, count, _inserted_at}] when count >= limit ->
        {:deny, limit}

      [{^key, count, inserted_at}] ->
        :ets.insert(@table, {key, count + 1, inserted_at})
        {:allow, count + 1}
    end
  end

  def handle_info(:cleanup, state) do
    cutoff = System.system_time(:millisecond) - :timer.hours(1)
    :ets.select_delete(@table, [{{:_, :_, :"$1"}, [{:<, :"$1", cutoff}], [true]}])
    schedule_cleanup()
    {:noreply, state}
  end

  defp schedule_cleanup, do: Process.send_after(self(), :cleanup, @cleanup_interval)
end
