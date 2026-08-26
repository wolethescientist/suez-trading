import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-fg-bone-muted transition-colors hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[0.875rem] leading-relaxed text-fg-bone-muted">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-none flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-sm border border-bone-line bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-bone-line px-5 py-4">
          <div>
            {title && (
              <h2 className="font-display text-[0.9375rem] font-bold text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-[0.8125rem] text-fg-bone-muted">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-bone-line">
        <Icon className="h-5 w-5 text-fg-bone-muted" />
      </div>
      <div>
        <p className="font-display text-[0.9375rem] font-bold text-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-[0.8125rem] leading-relaxed text-fg-bone-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
