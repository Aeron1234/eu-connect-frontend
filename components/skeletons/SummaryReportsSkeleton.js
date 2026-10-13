"use client";

export default function SummaryReportsSkeleton() {
  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8" aria-label="Loading summary reports">
      <div className="h-8 w-52 animate-pulse rounded bg-muted" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </main>
  );
}
