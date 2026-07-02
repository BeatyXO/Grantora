"use client";

import { AppShell } from "@/components/shell/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { useGrantoraLiveData } from "@/lib/genlayer/useLiveData";

export default function FundingCallsPage() {
  const { fundingCalls, isLive, usingDemoFallback } = useGrantoraLiveData();

  return (
    <AppShell
      eyebrow="Funding Call Registry"
      title="Active calls, strategic priorities, and review frames."
      description={
        isLive && !usingDemoFallback
          ? "A public registry of funding opportunities read live from the deployed Grantora contract."
          : "A public registry of funding opportunities created through the Grantora protocol."
      }
    >
      <section className="grid gap-6">
        {fundingCalls.map((call) => (
          <article key={call.id} className="glow-hover rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">{call.organization}</p>
                <h2 className="mt-2 font-display text-3xl text-white">{call.title}</h2>
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/82">
                Deadline {call.submissionDeadline}
              </div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Detail label="Funding objectives" value={call.fundingObjectives} />
              <Detail label="Evaluation criteria" value={call.evaluationCriteria} />
              <Detail label="Strategic priorities" value={call.strategicPriorities} />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-grantora-cream">Maximum award {call.maxFundingAmount}</span>
              <ButtonLink href="/proposals/new">Submit to this call</ButtonLink>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-3 text-sm leading-7 text-white/72">{value}</p>
    </div>
  );
}
