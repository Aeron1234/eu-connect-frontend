import { Skeleton } from "@/components/ui/skeleton";

function DtrRecordsSkeleton({ rows = 5, pagination = true, embedded = false, allowDelete = false }) {
  return (
    <div
      role="status"
      aria-label="Loading time records"
      className={embedded ? "min-w-0" : "min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"}
    >
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[540px] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2">
              <Skeleton className="h-2.5 w-14" />
            </th>
            <th className="text-left py-2">
              <Skeleton className="h-2.5 w-16" />
            </th>
            <th className="text-left py-2">
              <Skeleton className="h-2.5 w-16" />
            </th>
            <th className="text-right py-2">
              <Skeleton className="h-2.5 w-10 ml-auto" />
            </th>
            <th className="text-right py-2">
              <Skeleton className="h-2.5 w-12 ml-auto" />
            </th>
            {allowDelete && <th className="w-10 py-2" aria-hidden="true" />}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="py-3">
                <Skeleton className="h-3.5 w-20" />
              </td>
              <td className="py-3">
                <Skeleton className="h-5 w-20 rounded-md" />
              </td>
              <td className="py-3">
                <Skeleton className="h-5 w-20 rounded-md" />
              </td>
              <td className="py-3 text-right">
                <Skeleton className="h-3.5 w-8 ml-auto" />
              </td>
              <td className="py-3 text-right">
                <Skeleton className="h-5 w-16 rounded-md ml-auto" />
              </td>
              {allowDelete && (
                <td className="py-3 pl-2 text-right">
                  <Skeleton className="ml-auto size-4 rounded" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-3">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-3 w-14 rounded-md" />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>
      )}
    </div>
  );
}

export default DtrRecordsSkeleton;
