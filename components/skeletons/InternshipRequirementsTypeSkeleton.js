import { Skeleton } from "@/components/ui/skeleton";

function InternshipRequirementsTypeSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      {Array.from({ length: 2 }).map((_, ci) => (
        <div key={ci}>
          <Skeleton className="h-2.5 w-32 mb-3" />
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, ri) => (
              <li key={ri} className="flex items-start gap-2.5">
                <Skeleton className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default InternshipRequirementsTypeSkeleton;
