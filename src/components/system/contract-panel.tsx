import { getGrantoraRuntimeConfig } from "@/lib/genlayer/client";

const methods = [
  "create_funding_call",
  "submit_proposal",
  "request_review",
  "get_funding_calls",
  "get_proposals",
  "get_consensus_assessment",
];

export function ContractPanel() {
  const config = getGrantoraRuntimeConfig();
  const explorerBase = config.chain.blockExplorers?.default.url;
  const contractExplorerUrl =
    explorerBase && config.contractAddress ? `${explorerBase}/address/${config.contractAddress}` : null;

  return (
    <aside className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
      <h2 className="font-display text-2xl text-white">Contract Interaction Panel</h2>
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">GenLayer JS</p>
          <p className="mt-2 text-lg text-white">Pinned to `genlayer-js@1.1.8`</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-4 text-sm text-white/70">
          <p>Network: {config.network}</p>
          <p className="mt-2 break-all">RPC: {config.endpoint}</p>
          <p className="mt-2 break-all">Contract: {config.contractAddress ?? "Not configured"}</p>
          {contractExplorerUrl ? (
            <a
              href={contractExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-grantora-cream"
            >
              Open explorer link
            </a>
          ) : null}
        </div>
        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Expected Public Methods</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {methods.map((method) => (
              <li key={method}>{method}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
