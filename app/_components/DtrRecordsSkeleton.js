import { Skeleton } from "@/components/ui/skeleton";

function DtrRecordsSkeleton({ rows = 5, pagination = true }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 overflow-x-scroll">
      <table className="w-xl md:w-full text-sm">
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
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="mt-6 w-full flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      )}
    </div>
  );
}

export default DtrRecordsSkeleton;
