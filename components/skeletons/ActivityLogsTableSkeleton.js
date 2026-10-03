import { Skeleton } from "@/components/ui/skeleton";

function ActivityLogsTableSkeleton({ rows = 8 }) {
  return (
    <table className="w-full min-w-[720px] text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 sm:px-5 py-3">
            <Skeleton className="h-2.5 w-10" />
          </th>
          <th className="px-4 sm:px-5 py-3">
            <Skeleton className="h-2.5 w-14" />
          </th>
          <th className="px-4 sm:px-5 py-3">
            <Skeleton className="h-2.5 w-14" />
          </th>
          <th className="px-4 sm:px-5 py-3">
            <Skeleton className="h-2.5 w-20" />
          </th>
          <th className="px-4 sm:px-5 py-3 text-right">
            <Skeleton className="h-2.5 w-14 ml-auto" />
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b border-border last:border-0">
            <td className="px-4 sm:px-5 py-3 max-w-[180px] space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </td>
            <td className="px-4 sm:px-5 py-3 max-w-[280px] space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-2.5 w-48" />
            </td>
            <td className="px-4 sm:px-5 py-3">
              <Skeleton className="h-3 w-24" />
            </td>
            <td className="px-4 sm:px-5 py-3">
              <Skeleton className="h-3 w-32" />
            </td>
            <td className="px-4 sm:px-5 py-3 text-right">
              <Skeleton className="h-8 w-8 rounded-md ml-auto" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ActivityLogsTableSkeleton;
