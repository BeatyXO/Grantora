import { AppShell } from "@/components/shell/app-shell";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  ["01", "Publish a funding call", "Set objectives, criteria, and priorities."],
  ["02", "Register proposals", "Submit summaries and public evidence links."],
  ["03", "Request AI review", "Run consensus scoring across the proposal."],
  ["04", "Use the record", "Review strengths, risks, and next questions."],
];

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto max-w-4xl space-y-8 py-6 text-center">
        <span className="inline-flex rounded-full border border-white/16 bg-white/8 px-4 py-1 text-xs uppercase tracking-[0.32em] text-grantora-cream">
          Research Capital Intelligence
        </span>
        <h1 className="font-display text-5xl leading-[0.95] text-white md:text-7xl">
          Grant review that feels like a decision room, not a form portal.
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-white/72">
          Grantora turns public proposal evidence into clearer, explainable pre-review signal for funding programs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <ButtonLink href="/proposals/new" size="lg">
            Submit Proposal
          </ButtonLink>
          <ButtonLink href="/funding-calls/new" variant="ghost" size="lg">
            Create Funding Call
          </ButtonLink>
        </div>
      </section>

      <section className="rounded-[2.1rem] border border-white/10 bg-white/6 p-8 md:p-9">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">How it works</p>
        <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">A clear path from submission to shortlist.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {steps.map(([step, title, description]) => (
            <div key={step} className="glow-hover rounded-[1.5rem] border border-white/8 bg-black/18 p-5">
              <p className="text-sm text-grantora-accent">{step}</p>
              <h3 className="mt-3 font-display text-xl text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/68">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-9 text-center">
        <h2 className="font-display text-3xl text-white md:text-4xl">Already have proposals to review?</h2>
        <p className="max-w-xl text-sm leading-7 text-white/70">
          Open the dashboard for a live view of funding calls, proposals, and consensus records.
        </p>
        <ButtonLink href="/dashboard" variant="secondary" size="lg">
          Open Dashboard
        </ButtonLink>
      </section>
    </AppShell>
  );
}
