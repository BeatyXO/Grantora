import { AppShell } from "@/components/shell/app-shell";
import { ContractPanel } from "@/components/system/contract-panel";

export default function SettingsPage() {
  return (
    <AppShell
      eyebrow="Settings"
      title="Network, contract, and wallet configuration."
      description="This page centralizes the operational pieces needed to point the frontend at a deployed Grantora Intelligent Contract on GenLayer StudioNet."
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
          <h2 className="font-display text-2xl text-white">Environment Variables</h2>
          <div className="mt-4 space-y-3 rounded-2xl bg-black/20 p-4 font-mono text-sm text-white/76">
            <p>`NEXT_PUBLIC_GENLAYER_NETWORK=studionet`</p>
            <p>`NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api`</p>
            <p>`NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS=0x...`</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/68">
            If the contract address is omitted, the app renders against bundled demo data while
            still exposing the live transaction methods and deployment assets.
          </p>
        </div>
        <ContractPanel />
      </section>
    </AppShell>
  );
}
