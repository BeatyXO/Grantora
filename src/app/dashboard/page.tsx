"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { ContractPanel } from "@/components/system/contract-panel";
import { useGrantoraLiveData } from "@/lib/genlayer/useLiveData";
import { readConsensusAssessment } from "@/lib/genlayer/grantora";
import { demoConsensus } from "@/lib/mock-data";
import { ConsensusRecord } from "@/lib/types";

export default function DashboardPage() {
  const { fundingCalls, proposals, isLive, usingDemoFallback, error } = useGrantoraLiveData();
  const [consensusRecords, setConsensusRecords] = useState<ConsensusRecord[]>(demoConsensus);

  useEffect(() => {
    if (!isLive) {
      setConsensusRecords(demoConsensus);
      return;
    }

    const consensusReady = proposals.filter((proposal) => proposal.status === "CONSENSUS_READY" || proposal.status === "consensus_ready");
    if (consensusReady.length === 0) {
      setConsensusRecords([]);
      return;
    }

    Promise.all(consensusReady.map((proposal) => readConsensusAssessment(proposal.id))).then((records) => {
      setConsensusRecords(records.filter((record): record is ConsensusRecord => record !== null));
    });
  }, [isLive, proposals]);

  return (
    <AppShell
      eyebrow="Proposal Dashboard"
      title="Funding intelligence across calls, submissions, and consensus outcomes."
      description={
        isLive
          ? usingDemoFallback
            ? "Connected to the deployed contract, but no on-chain records exist yet — showing demo records shaped to the contract model."
            : "Live records read directly from the deployed Grantora Intelligent Contract."
          : "The contract is the source of truth. Until a Studionet address is configured, this dashboard runs against bundled demo records shaped to the contract model."
      }
    >
      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200/80">{error}</p>
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">Funding Calls</h2>
              <ButtonLink href="/funding-calls/new" variant="ghost">
                New call
              </ButtonLink>
            </div>
            <div className="mt-4 space-y-4">
              {fundingCalls.map((call) => (
                <div key={call.id} className="glow-hover rounded-2xl border border-transparent bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">{call.organization}</p>
                      <h3 className="mt-1 text-xl text-white">{call.title}</h3>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                      {call.maxFundingAmount}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/68">{call.fundingObjectives}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">Proposals</h2>
              <ButtonLink href="/proposals/new" variant="ghost">
                Submit proposal
              </ButtonLink>
            </div>
            <div className="mt-4 space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="glow-hover rounded-2xl border border-transparent bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl text-white">{proposal.title}</h3>
                      <p className="mt-1 text-sm text-white/56">{proposal.principalInvestigator}</p>
                    </div>
                    <span className="rounded-full bg-grantora-accent/15 px-3 py-1 text-sm text-grantora-accent">
                      {proposal.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/70">{proposal.researchSummary}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <Link href={`/proposals/${proposal.id}`} className="text-grantora-cream">
                      Proposal detail
                    </Link>
                    <Link href={`/consensus/${proposal.id}`} className="text-grantora-cream">
                      Consensus viewer
                    </Link>
                    <Link href={`/public/proposals/${proposal.id}`} className="text-grantora-cream">
                      Public page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ContractPanel />
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <h2 className="font-display text-2xl text-white">Consensus Queue</h2>
            <div className="mt-4 space-y-4">
              {consensusRecords.length === 0 ? (
                <p className="text-sm text-white/50">No consensus assessments yet.</p>
              ) : (
                consensusRecords.map((record) => (
                  <div key={record.proposalId} className="glow-hover rounded-2xl border border-transparent bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white">{record.fundingRecommendation}</p>
                      <span className="text-sm text-grantora-accent">{record.confidenceScore}%</span>
                    </div>
                    <p className="mt-2 text-sm text-white/60">{record.recommendationSummary}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
