"use client";

import { use, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { ReviewActionCard } from "@/components/workflows/review-action-card";
import { isLiveModeConfigured, readConsensusAssessment, readProposal } from "@/lib/genlayer/grantora";
import { getConsensusByProposalId, getProposalById } from "@/lib/mock-data";
import { ConsensusRecord, Proposal } from "@/lib/types";

const scoreLabels: Record<string, string> = {
  scientificMeritScore: "Scientific merit",
  noveltyScore: "Novelty",
  societalImpactScore: "Societal impact",
  feasibilityScore: "Feasibility",
  budgetCredibilityScore: "Budget credibility",
  fundingCallAlignmentScore: "Funding call alignment",
  confidenceScore: "Confidence",
};

export default function ConsensusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proposal, setProposal] = useState<Proposal | undefined>(() => getProposalById(id));
  const [consensus, setConsensus] = useState<ConsensusRecord | undefined>(() => getConsensusByProposalId(id));
  const [loading, setLoading] = useState(isLiveModeConfigured());

  const refresh = useCallback(() => {
    if (!isLiveModeConfigured()) return;

    setLoading(true);
    Promise.all([readProposal(id).catch(() => null), readConsensusAssessment(id).catch(() => null)])
      .then(([liveProposal, liveConsensus]) => {
        if (liveProposal) setProposal(liveProposal);
        setConsensus(liveConsensus ?? undefined);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!proposal) {
    return (
      <AppShell eyebrow="Consensus Viewer" title="Proposal not found">
        <p className="text-sm text-white/60">
          {loading ? "Loading from the contract…" : "No proposal exists with this ID in demo data or on-chain."}
        </p>
      </AppShell>
    );
  }

  if (!consensus) {
    return (
      <AppShell
        eyebrow="Consensus Viewer"
        title={`AI review for ${proposal.title}`}
        description="No consensus assessment has been recorded for this proposal yet."
      >
        <section className="mx-auto max-w-2xl">
          <ReviewActionCard proposalId={proposal.id} onReviewed={refresh} loading={loading} prominent />
        </section>
      </AppShell>
    );
  }

  const scoreEntries = Object.entries(scoreLabels).map(([key, label]) => ({
    label,
    value: consensus[key as keyof typeof consensus] as number,
  }));

  return (
    <AppShell
      eyebrow="Consensus Viewer"
      title={`AI review for ${proposal.title}`}
      description="Validator-backed review output designed to help human funding panels focus on the highest-leverage proposals first."
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Funding recommendation</p>
                <h2 className="mt-2 font-display text-3xl text-white">{consensus.fundingRecommendation}</h2>
              </div>
              <span className="rounded-full bg-grantora-accent/15 px-4 py-2 text-sm text-grantora-accent">
                {consensus.confidenceScore}% confidence
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/72">{consensus.recommendationSummary}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {scoreEntries.map((score) => (
                <div key={score.label} className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-white/55">{score.label}</p>
                  <p className="mt-2 text-3xl text-white">{score.value}%</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
              <h3 className="font-display text-2xl text-white">Key Strengths</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/72">
                {consensus.keyStrengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
              <h3 className="font-display text-2xl text-white">Key Risks</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/72">
                {consensus.keyRisks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <h3 className="font-display text-2xl text-white">Follow-up Questions</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/72">
              {consensus.followUpQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <ReviewActionCard proposalId={proposal.id} onReviewed={refresh} />
      </section>
    </AppShell>
  );
}
