import { Skeleton } from "@/components/ui/skeleton";

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: 4 }).map((_, i) => {
        const isPrimary = i === 0;

        return (
          <div
            key={i}
            className={`flex h-30 flex-col justify-between rounded-xl border p-4 shadow-sm sm:h-22 ${
              isPrimary
                ? "border-primary bg-primary"
                : "border-border bg-card"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Skeleton
                className={`h-4 w-4 rounded ${isPrimary ? "bg-white/30" : ""}`}
              />
              <Skeleton
                className={`h-3 w-24 ${isPrimary ? "bg-white/30" : ""}`}
              />
            </div>
            <Skeleton
              className={`mt-3 h-7 w-12 sm:h-5 ${isPrimary ? "bg-white/30" : ""}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DashboardStatsSkeleton;
