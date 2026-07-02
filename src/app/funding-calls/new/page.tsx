import { AppShell } from "@/components/shell/app-shell";
import { FundingCallForm } from "@/components/workflows/funding-call-form";

export default function CreateFundingCallPage() {
  return (
    <AppShell
      eyebrow="Create Funding Call"
      title="Publish the review frame before proposals ever arrive."
      description="Funding calls define eligibility, evaluation logic, and strategic priorities. The Grantora contract stores the canonical record."
    >
      <FundingCallForm />
    </AppShell>
  );
}
