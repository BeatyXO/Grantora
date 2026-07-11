"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { demoFundingCalls } from "@/lib/mock-data";
import { isLiveModeConfigured, readFundingCalls, submitProposalDemo, writeSubmitProposal } from "@/lib/genlayer/grantora";
import { TransactionStateCard } from "@/components/workflows/transaction-state-card";
import { useWallet } from "@/lib/wallet-context";
import { FundingCall } from "@/lib/types";

const initialState = {
  fundingCallId: "",
  title: "",
  principalInvestigator: "",
  researchSummary: "",
  problemStatement: "",
  objectives: "",
  methodology: "",
  budgetSummary: "",
  impactStatement: "",
  evidenceUrls: "",
};

export function ProposalForm() {
  const { address } = useWallet();
  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>(demoFundingCalls);
  const [values, setValues] = useState(initialState);
  const [state, setState] = useState<{ status: "idle" | "pending" | "success" | "error"; hash?: string; message?: string }>({
    status: "idle",
  });

  const liveMode = isLiveModeConfigured() && Boolean(address);

  useEffect(() => {
    if (!isLiveModeConfigured()) return;
    readFundingCalls()
      .then((calls) => {
        const list = Object.values(calls);
        if (list.length > 0) setFundingCalls(list);
      })
      .catch(() => {
        // Contract not reachable yet; keep demo calls as a fallback for the dropdown.
      });
  }, []);

  useEffect(() => {
    const isCurrentSelectionValid = fundingCalls.some((call) => call.id === values.fundingCallId);
    if (!isCurrentSelectionValid && fundingCalls[0]) {
      void Promise.resolve().then(() => {
        setValues((current) => ({ ...current, fundingCallId: fundingCalls[0].id }));
      });
    }
  }, [fundingCalls, values.fundingCallId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "pending" });

    const evidenceUrls = values.evidenceUrls
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      if (liveMode && address) {
        const receipt = await writeSubmitProposal(address as `0x${string}`, { ...values, evidenceUrls });
        setState({
          status: "success",
          hash: receipt.hash,
          message: "Proposal registered on-chain. It will appear in the registry once indexed.",
        });
      } else {
        const result = await submitProposalDemo({ ...values, evidenceUrls });
        setState({ status: "success", hash: result.hash, message: result.message });
      }
      setValues({ ...initialState, fundingCallId: fundingCalls[0]?.id ?? "" });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to register proposal.",
      });
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/72">
            Funding call
            <select
              value={values.fundingCallId}
              onChange={(event) => setValues({ ...values, fundingCallId: event.target.value })}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              {fundingCalls.map((call) => (
                <option key={call.id} value={call.id} className="bg-grantora-plum">
                  {call.title}
                </option>
              ))}
            </select>
          </label>
          <Field label="Proposal title" value={values.title} onChange={(title) => setValues({ ...values, title })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Principal investigator"
            value={values.principalInvestigator}
            onChange={(principalInvestigator) => setValues({ ...values, principalInvestigator })}
          />
          <Field label="Budget summary" value={values.budgetSummary} onChange={(budgetSummary) => setValues({ ...values, budgetSummary })} />
        </div>
        <div className="mt-4 grid gap-4">
          <Area label="Research summary" value={values.researchSummary} onChange={(researchSummary) => setValues({ ...values, researchSummary })} />
          <Area label="Problem statement" value={values.problemStatement} onChange={(problemStatement) => setValues({ ...values, problemStatement })} />
          <Area label="Objectives" value={values.objectives} onChange={(objectives) => setValues({ ...values, objectives })} />
          <Area label="Methodology" value={values.methodology} onChange={(methodology) => setValues({ ...values, methodology })} />
          <Area label="Impact statement" value={values.impactStatement} onChange={(impactStatement) => setValues({ ...values, impactStatement })} />
          <Area
            label="Public evidence URLs (one per line)"
            value={values.evidenceUrls}
            onChange={(evidenceUrls) => setValues({ ...values, evidenceUrls })}
          />
        </div>
        <div className="mt-8 flex flex-col-reverse items-stretch gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-6 text-white/45">
            {liveMode
              ? "This will submit `submit_proposal` to the deployed contract. Only public references are sent - no files."
              : "Connect a wallet to submit on-chain. Without one, this runs in demo mode."}
          </p>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Register proposal
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
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
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
