"use client";

export default function AccountSummaryCard({ roleLabel, status, email }) {
  return (
    <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
        Account
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-medium">{roleLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium text-primary-emphasis">{status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="max-w-[60%] truncate font-medium">{email}</dd>
        </div>
      </dl>
    </section>
  );
}
