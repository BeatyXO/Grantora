"use client";

import { useCallback, useEffect, useState } from "react";
import { isLiveModeConfigured, readFundingCalls, readProposals } from "@/lib/genlayer/grantora";
import { demoFundingCalls, demoProposals } from "@/lib/mock-data";
import { FundingCall, Proposal } from "@/lib/types";

export function useGrantoraLiveData() {
  const isLive = isLiveModeConfigured();
  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>(demoFundingCalls);
  const [proposals, setProposals] = useState<Proposal[]>(demoProposals);
  const [loading, setLoading] = useState(isLive);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoFallback, setUsingDemoFallback] = useState(!isLive);

  const refresh = useCallback(async () => {
    if (!isLive) {
      setFundingCalls(demoFundingCalls);
      setProposals(demoProposals);
      setUsingDemoFallback(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [callsResult, proposalsResult] = await Promise.all([readFundingCalls(), readProposals()]);
      const callsList = Object.values(callsResult);
      const proposalsList = Object.values(proposalsResult);
      setFundingCalls(callsList.length > 0 ? callsList : demoFundingCalls);
      setProposals(proposalsList.length > 0 ? proposalsList : demoProposals);
      setUsingDemoFallback(callsList.length === 0 && proposalsList.length === 0);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to read from the contract.");
      setFundingCalls(demoFundingCalls);
      setProposals(demoProposals);
      setUsingDemoFallback(true);
    } finally {
      setLoading(false);
    }
  }, [isLive]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return { fundingCalls, proposals, loading, error, isLive, usingDemoFallback, refresh };
}
