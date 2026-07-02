import { AppShell } from "@/components/shell/app-shell";
import { ProposalForm } from "@/components/workflows/proposal-form";

export default function CreateProposalPage() {
  return (
    <AppShell
      eyebrow="Submit Proposal"
      title="Register evidence-rich proposals without private uploads."
      description="Proposal authors submit structured content plus public evidence URLs. Wallet ownership and hashes stay on-chain. Files stay where they already live."
    >
      <ProposalForm />
    </AppShell>
  );
}
