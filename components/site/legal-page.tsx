export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-cargo">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] text-ink">{title}</h1>
        <p className="mt-3 text-[0.8125rem] text-fg-bone-muted">Last updated {updated}</p>
        <div className="prose-suez mt-10 space-y-8">{children}</div>
      </div>
    </section>
  );
}

export function Clause({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink">{heading}</h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ink-3">
        {children}
      </div>
    </section>
  );
}
