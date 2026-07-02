import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";

export default function NotFound() {
  return (
    <AppShell eyebrow="Not Found" title="That Grantora record does not exist yet.">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 text-white/72">
        <p>This route is wired, but the requested demo entity was not found.</p>
        <Link href="/dashboard" className="mt-4 inline-flex text-grantora-cream">
          Return to dashboard
        </Link>
      </div>
    </AppShell>
  );
}
