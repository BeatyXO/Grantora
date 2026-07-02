import { AppShell } from "@/components/shell/app-shell";

export default function Loading() {
  return (
    <AppShell eyebrow="Loading" title="Preparing funding intelligence view...">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-white/70">
        Grantora is loading contract-shaped records and preparing the interface.
      </div>
    </AppShell>
  );
}
