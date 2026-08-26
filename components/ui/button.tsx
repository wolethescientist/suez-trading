import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "ghost" | "danger" | "subtle" | "onInk";
type Size = "sm" | "md" | "lg";

/**
 * Pill buttons in uppercase Switzer, matching Suez Electric and Suez Gas.
 * Shape carries the emphasis; there are no shadows anywhere in the system.
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-label font-semibold " +
  "transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-cargo text-white hover:bg-cargo-ink",
  dark: "bg-ink text-fg-ink hover:bg-ink-2",
  outline:
    "border border-fg-bone/25 text-fg-bone hover:border-fg-bone hover:bg-fg-bone hover:text-bone",
  onInk:
    "border border-fg-ink/25 text-fg-ink hover:border-fg-ink hover:bg-fg-ink hover:text-ink",
  ghost: "text-fg-bone hover:bg-bone-2",
  subtle: "border border-bone-line bg-white text-fg-bone hover:border-fg-bone",
  danger: "bg-alert text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.6875rem]",
  md: "h-11 px-6 text-[0.75rem]",
  lg: "h-13 px-8 text-[0.8125rem]",
};

type CommonProps = { variant?: Variant; size?: Size; className?: string };

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & React.ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
