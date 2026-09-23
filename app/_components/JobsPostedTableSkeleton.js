import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

function JobsPostedTableSkeleton({ rows = 5 }) {
  return (
    <section className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-4">
        <Briefcase className="w-4 h-4 text-primary-500" />
        Jobs You Posted
      </h3>

      <div className="overflow-x-auto">
        <table className="w-2xl md:w-full text-sm">
          <thead>
            <tr className="border-b border-stone-300">
              <th className="text-left py-2">
                <Skeleton className="h-2.5 w-16" />
              </th>
              <th className="text-left py-2">
                <Skeleton className="h-2.5 w-16" />
              </th>
              <th className="text-left py-2">
                <Skeleton className="h-2.5 w-10" />
              </th>
              <th className="text-right py-2">
                <Skeleton className="h-2.5 w-16 ml-auto" />
              </th>
              <th className="text-right py-2">
                <Skeleton className="h-2.5 w-12 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-stone-300 last:border-b-0">
                <td className="py-3">
                  <Skeleton className="h-3.5 w-32" />
                </td>
                <td className="py-3">
                  <Skeleton className="h-3.5 w-24" />
                </td>
                <td className="py-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-3 text-right">
                  <Skeleton className="h-3.5 w-6 ml-auto" />
                </td>
                <td className="py-3 text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 w-full flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </section>
  );
}

export default JobsPostedTableSkeleton;
