import { Skeleton } from "@/components/ui/skeleton";

function AccountSummaryCardSkeleton() {
  return (
    <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <Skeleton className="h-2.5 w-16" />
      <div className="mt-4 space-y-3">
        {["w-10", "w-14", "w-12"].map((w, i) => (
          <div key={i} className="flex justify-between gap-4">
            <Skeleton className={`h-3 ${w}`} />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default AccountSummaryCardSkeleton;
