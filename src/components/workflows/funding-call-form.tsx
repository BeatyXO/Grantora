"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isLiveModeConfigured, submitFundingCallDemo, writeCreateFundingCall } from "@/lib/genlayer/grantora";
import { TransactionStateCard } from "@/components/workflows/transaction-state-card";
import { useWallet } from "@/lib/wallet-context";

const initialState = {
  title: "",
  organization: "",
  fundingObjectives: "",
  eligibilityRequirements: "",
  evaluationCriteria: "",
  maxFundingAmount: "",
  submissionDeadline: "",
  strategicPriorities: "",
};

export function FundingCallForm() {
  const { address } = useWallet();
  const [values, setValues] = useState(initialState);
  const [state, setState] = useState<{ status: "idle" | "pending" | "success" | "error"; hash?: string; message?: string }>({
    status: "idle",
  });

  const liveMode = isLiveModeConfigured() && Boolean(address);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "pending" });

    try {
      if (liveMode && address) {
        const receipt = await writeCreateFundingCall(address as `0x${string}`, values);
        setState({
          status: "success",
          hash: receipt.hash,
          message: "Funding call created on-chain. It will appear in the registry once indexed.",
        });
      } else {
        const result = await submitFundingCallDemo(values);
        setState({ status: "success", hash: result.hash, message: result.message });
      }
      setValues(initialState);
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to create funding call.",
      });
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Funding call title" value={values.title} onChange={(title) => setValues({ ...values, title })} />
          <Field
            label="Organization name"
            value={values.organization}
            onChange={(organization) => setValues({ ...values, organization })}
          />
        </div>
        <div className="mt-4 grid gap-4">
          <Area label="Funding objectives" value={values.fundingObjectives} onChange={(fundingObjectives) => setValues({ ...values, fundingObjectives })} />
          <Area label="Eligibility requirements" value={values.eligibilityRequirements} onChange={(eligibilityRequirements) => setValues({ ...values, eligibilityRequirements })} />
          <Area label="Evaluation criteria" value={values.evaluationCriteria} onChange={(evaluationCriteria) => setValues({ ...values, evaluationCriteria })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Maximum funding" value={values.maxFundingAmount} onChange={(maxFundingAmount) => setValues({ ...values, maxFundingAmount })} />
          <Field label="Submission deadline" value={values.submissionDeadline} onChange={(submissionDeadline) => setValues({ ...values, submissionDeadline })} />
          <Field label="Strategic priorities" value={values.strategicPriorities} onChange={(strategicPriorities) => setValues({ ...values, strategicPriorities })} />
        </div>
        <div className="mt-8 flex flex-col-reverse items-stretch gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-6 text-white/45">
            {liveMode
              ? "This will submit `create_funding_call` to the deployed contract and wait for consensus acceptance."
              : "Connect a wallet to submit on-chain. Without one, this runs in demo mode."}
          </p>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Create funding call
          </Button>
        </div>
      </form>
      <TransactionStateCard state={state} />
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/35"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
      />
    </label>
  );
}
