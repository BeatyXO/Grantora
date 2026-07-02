import Link from "next/link";
import { WalletConnector } from "@/components/wallet/wallet-connector";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/funding-calls", label: "Funding Calls" },
  { href: "/proposals/new", label: "Proposal" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  eyebrow,
  title,
  description,
}: Readonly<{
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
}>) {
  return (
    <div className="min-h-screen bg-grantora-plum text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(165,106,189,0.30),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(245,235,250,0.12),_transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div>
              <Link href="/" className="font-display text-3xl text-white">
                Grantora
              </Link>
              <p className="mt-1 text-sm text-white/58">Decentralized Grant Review and Impact Consensus</p>
            </div>
            <nav className="flex flex-wrap gap-2.5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="glow-hover rounded-full border border-white/10 px-4 py-2 text-sm text-white/72 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <WalletConnector />
          </div>
        </header>

        {(eyebrow || title || description) ? (
          <section className="mt-10 space-y-3">
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.28em] text-grantora-lilac">{eyebrow}</p>
            ) : null}
            {title ? <h1 className="font-display text-4xl text-white md:text-5xl">{title}</h1> : null}
            {description ? (
              <p className="max-w-3xl text-base leading-8 text-white/68">{description}</p>
            ) : null}
          </section>
        ) : null}

        <main className="mt-8 flex-1 space-y-8">{children}</main>
      </div>
    </div>
  );
}
