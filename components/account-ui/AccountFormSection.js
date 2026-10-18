export default function AccountFormSection({ number, title, description, children }) {
  return (
    <section className="space-y-5" aria-label={title}>
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-[11px] font-bold tabular-nums text-primary-emphasis">{number}</span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
