type TransactionState = {
  status: "idle" | "pending" | "success" | "error";
  hash?: string;
  message?: string;
};

export function TransactionStateCard({ state }: { state: TransactionState }) {
  const title =
    state.status === "pending"
      ? "Waiting for wallet and network response"
      : state.status === "success"
        ? "Transaction confirmed"
        : state.status === "error"
          ? "Transaction failed"
          : "Transaction state";

  const body =
    state.status === "pending"
      ? "Grantora is submitting a wallet-signed write to the GenLayer contract and waiting for consensus acceptance."
      : state.status === "success" || state.status === "error"
        ? state.message
        : "Form actions surface loading, success, and hash feedback here so the UX stays transparent during contract calls.";

  return (
    <aside
      className={`rounded-[1.75rem] border p-6 ${
        state.status === "error"
          ? "border-rose-400/30 bg-rose-500/10"
          : state.status === "success"
            ? "border-emerald-400/30 bg-emerald-500/10"
            : "border-white/10 bg-white/6"
      }`}
    >
      <div className="flex items-center gap-3">
        {state.status === "success" ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
            ✓
          </span>
        ) : null}
        <h2 className="font-display text-2xl text-white">{title}</h2>
      </div>
      <p className="mt-4 text-sm leading-7 text-white/68">{body}</p>
      <div className="mt-6 rounded-2xl bg-black/20 p-4 text-sm text-white/72">
        <p>Status: {state.status}</p>
        <p className="mt-2 break-all">Hash: {state.hash ?? "Not available yet"}</p>
      </div>
    </aside>
  );
}
