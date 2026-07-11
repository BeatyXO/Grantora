"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isLiveModeConfigured, requestLiveConsensusReview, requestReviewDemo } from "@/lib/genlayer/grantora";
import { TransactionStateCard } from "@/components/workflows/transaction-state-card";
import { useWallet } from "@/lib/wallet-context";

export function ReviewActionCard({
  proposalId,
  onReviewed,
  loading,
  prominent,
}: {
  proposalId: string;
  onReviewed?: () => void;
  loading?: boolean;
  prominent?: boolean;
}) {
  const { address } = useWallet();
  const [state, setState] = useState<{ status: "idle" | "pending" | "success" | "error"; hash?: string; message?: string }>({
    status: "idle",
  });

  const liveMode = isLiveModeConfigured() && Boolean(address);

  async function requestReview() {
    setState({ status: "pending" });
    try {
      if (liveMode && address) {
        const receipt = await requestLiveConsensusReview(address as `0x${string}`, proposalId);
        setState({
          status: "success",
          hash: receipt.hash,
          message: "Consensus review accepted. The contract returns the evidence-grounded assessment without post-consensus storage writes.",
        });
        onReviewed?.();
      } else {
        const result = await requestReviewDemo(proposalId);
        setState({ status: "success", hash: result.hash, message: result.message });
      }
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to request review.",
      });
    }
  }

  const isBusy = state.status === "pending";

  return (
    <div className="space-y-6">
      <div
        className={
          prominent
            ? "glow-hover rounded-[2.2rem] border-2 border-grantora-accent/40 bg-[linear-gradient(180deg,rgba(165,106,189,0.16),rgba(11,7,20,0.3))] p-10 text-center"
            : "rounded-[1.75rem] border border-white/10 bg-white/6 p-6"
        }
      >
        <h2 className={prominent ? "font-display text-3xl text-white" : "font-display text-2xl text-white"}>
          Request AI Review
        </h2>
        <p className={prominent ? "mx-auto mt-4 max-w-md text-sm leading-7 text-white/68" : "mt-4 text-sm leading-7 text-white/68"}>
          {loading
            ? "Loading from the contract..."
            : liveMode
              ? "This sends `request_review` to the Intelligent Contract and waits for GenLayer consensus over fetched public evidence. This can take a few minutes."
              : "Connect a wallet to run a live review. Without one, this runs in demo mode."}
        </p>
        <Button
          onClick={requestReview}
          disabled={isBusy}
          size={prominent ? "lg" : "default"}
          className={prominent ? "mt-8 px-10" : "mt-6"}
        >
          {isBusy ? "Waiting for consensus..." : "Trigger review"}
        </Button>
      </div>
      <TransactionStateCard state={state} />
    </div>
  );
}
