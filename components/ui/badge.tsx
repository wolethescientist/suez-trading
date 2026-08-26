import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-bone-line text-fg-bone-muted",
  success: "border-signal/30 bg-signal-soft text-signal",
  warning: "border-cargo/35 bg-cargo/10 text-cargo-ink",
  danger: "border-alert/30 bg-alert-soft text-alert",
  dark: "border-ink bg-ink text-fg-ink",
  amber: "border-cargo bg-cargo text-white",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-label text-[0.625rem] tracking-[0.1em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Keeps status colour consistent everywhere an order state is shown. */
export function statusTone(status: string): keyof typeof tones {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "success";
    case "PENDING":
    case "PROCESSING":
      return "warning";
    case "SHIPPED":
      return "dark";
    case "FAILED":
    case "CANCELLED":
    case "ABANDONED":
      return "danger";
    default:
      return "neutral";
  }
}
