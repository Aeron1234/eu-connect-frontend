import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import RecentActivityCardSkeleton from "@/app/_components/RecentActivityCardSkeleton";

function StudentDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Today card */}
      <section className="rounded-xl bg-primary-500 p-5 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex flex-1 flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3 w-12 bg-white/25" />
            <Skeleton className="h-7 sm:h-8 w-56 sm:w-72 mt-2 bg-white/25" />

            <div className="grid grid-cols-3 gap-6 mt-4 max-w-md">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-2.5 w-14 bg-white/25" />
                  <Skeleton className="h-5 w-16 mt-1.5 bg-white/25" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 mt-4">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-white/40" />
              <Skeleton className="h-3 w-56 sm:w-80 bg-white/25" />
            </div>
          </div>

          <Skeleton className="self-start md:self-auto flex-shrink-0 h-10 w-44 rounded-md bg-white/70" />
        </div>
      </section>

      {/* Recent Time Records */}
      <section className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-4 h-4 rounded-full border-2 border-primary-500 flex-shrink-0" />
          <Skeleton className="h-3.5 w-40" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-xl md:w-full text-sm">
            <thead>
              <tr className="border-b border-stone-300">
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
                <th className="py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-stone-300 last:border-b-0"
                >
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
                  <td className="py-3 pl-2 text-right">
                    <Skeleton className="h-4 w-4 ml-auto" />
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

      {/* Activity + sidebar row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentActivityCardSkeleton />
        </div>

        <div className="flex flex-col gap-5">
          {/* Internship progress */}
          <div className="rounded-xl bg-primary-500 p-5">
            <Skeleton className="h-3.5 w-32 bg-white/25" />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <Skeleton className="h-2.5 w-20 bg-white/25" />
                <Skeleton className="h-2.5 w-10 bg-white/25" />
              </div>
              <div className="h-2 rounded-full bg-primary-50/50 overflow-hidden">
                <Skeleton className="h-full w-1/3 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-xl bg-white border border-stone-300 shadow-sm h-64 lg:h-full min-h-64 overflow-hidden">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboardLoading;
