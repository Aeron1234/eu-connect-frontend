import { Skeleton } from "@/components/ui/skeleton";

// Match DashboardStats breakpoints and three-versus-four desktop columns so
// loading does not introduce a different small-screen stat-card layout.
function DashboardStatsSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} lg:gap-4`}>
      {Array.from({ length: count }).map((_, i) => {
        const isPrimary = i === 0;

        return (
          <div
            key={i}
            className={`flex min-h-28 flex-col justify-between rounded-xl border p-4 shadow-sm ${
              isPrimary
                ? "border-primary bg-primary"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2">
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
