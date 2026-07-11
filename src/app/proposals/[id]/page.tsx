"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { isLiveModeConfigured, readConsensusAssessment, readFundingCalls, readProposal } from "@/lib/genlayer/grantora";
import { getConsensusByProposalId, getFundingCallById, getProposalById } from "@/lib/mock-data";
import { ConsensusRecord, FundingCall, Proposal } from "@/lib/types";

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proposal, setProposal] = useState<Proposal | undefined>(() => getProposalById(id));
  const [call, setCall] = useState<FundingCall | undefined>(() =>
    proposal ? getFundingCallById(proposal.fundingCallId) : undefined,
  );
  const [consensus, setConsensus] = useState<ConsensusRecord | undefined>(() => getConsensusByProposalId(id));
  const [loading, setLoading] = useState(isLiveModeConfigured());

  useEffect(() => {
    if (!isLiveModeConfigured()) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      setLoading(true);

      Promise.all([readProposal(id).catch(() => null), readFundingCalls().catch(() => null)])
        .then(async ([liveProposal, liveCalls]) => {
          if (cancelled) return;
          if (liveProposal) {
            setProposal(liveProposal);
            setCall(liveCalls?.[liveProposal.fundingCallId] ?? getFundingCallById(liveProposal.fundingCallId));
            const liveConsensus = await readConsensusAssessment(id).catch(() => null);
            if (!cancelled) setConsensus(liveConsensus ?? undefined);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!proposal) {
    return (
      <AppShell eyebrow="Proposal Detail" title="Proposal not found">
        <p className="text-sm text-white/60">
          {loading ? "Loading from the contract..." : "No proposal exists with this ID in demo data or on-chain."}
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell eyebrow="Proposal Detail" title={proposal.title} description={proposal.researchSummary}>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Principal Investigator</p>
              <p className="mt-2 text-lg text-white">{proposal.principalInvestigator}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Funding Call</p>
              <p className="mt-2 text-lg text-white">{call?.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Owner Wallet</p>
              <p className="mt-2 break-all text-lg text-white">{proposal.ownerAddress}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Proposal Status</p>
              <p className="mt-2 text-lg text-white">{proposal.status}</p>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {[
              ["Problem statement", proposal.problemStatement],
              ["Objectives", proposal.objectives],
              ["Methodology", proposal.methodology],
              ["Budget summary", proposal.budgetSummary],
              ["Impact statement", proposal.impactStatement],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
                <p className="mt-2 text-sm leading-7 text-white/72">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <h2 className="font-display text-2xl text-white">Evidence URLs</h2>
            <div className="mt-4 space-y-3">
              {proposal.evidenceUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-black/20 p-4 text-sm text-grantora-cream"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
          {consensus ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
              <h2 className="font-display text-2xl text-white">Consensus Summary</h2>
              <p className="mt-4 text-white">{consensus.fundingRecommendation}</p>
              <p className="mt-2 text-sm leading-7 text-white/68">{consensus.recommendationSummary}</p>
            </div>
          ) : null}
        </aside>
      </section>
    </AppShell>
  );
}
