import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-grantora-accent text-white shadow-[0_0_24px_rgba(165,106,189,0.55)] hover:bg-[#b57bc8] hover:shadow-[0_0_38px_rgba(165,106,189,0.85)] hover:-translate-y-0.5",
        secondary: "glow-hover bg-grantora-cream text-grantora-plum hover:bg-white",
        ghost: "glow-hover border border-white/15 bg-white/8 text-white hover:bg-white/12",
      },
      size: {
        default: "px-5 py-3 text-sm",
        lg: "px-7 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  children,
}: React.PropsWithChildren<{
  className?: string;
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
