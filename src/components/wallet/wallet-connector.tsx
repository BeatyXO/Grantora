"use client";

import { Button } from "@/components/ui/button";
import { formatWalletAddress } from "@/lib/genlayer/grantora";
import { useWallet } from "@/lib/wallet-context";

export function WalletConnector() {
  const { address, pending, error, connect } = useWallet();

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button variant="secondary" onClick={connect} disabled={pending}>
        {address ? formatWalletAddress(address) : pending ? "Connecting..." : "Connect wallet"}
      </Button>
      {error ? (
        <p className="max-w-60 text-right text-xs text-rose-200/80">{error}</p>
      ) : !address ? (
        <p className="max-w-60 text-right text-xs text-white/35">MetaMask and compatible injected wallets</p>
      ) : null}
    </div>
  );
}
