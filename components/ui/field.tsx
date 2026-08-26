import { cn } from "@/lib/utils";

export const inputClass =
  "w-full h-11 rounded-sm border border-bone-line bg-white px-3.5 text-sm text-fg-bone " +
  "placeholder:text-fg-bone-muted/60 transition-colors focus:border-cargo focus:outline-none " +
  "disabled:bg-bone-2 disabled:text-fg-bone-muted";

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block font-label text-[0.625rem] tracking-[0.11em] text-fg-bone-muted"
      >
        {label}
        {required && <span className="ml-1 text-cargo">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fg-bone-muted">{hint}</p>
      ) : null}
    </div>
  );
}
