import { Skeleton } from "@/components/ui/skeleton";
import { Building2, GraduationCap } from "lucide-react";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";

function FormFieldSkeleton() {
  return (
    <div>
      <Skeleton className="h-2.5 w-24 mb-1.5" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

function DepartmentsAndCoursesLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <PageTitleSkeleton />

      {/* Add forms */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="size-4 text-foreground-faint" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="space-y-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <GraduationCap className="size-4 text-foreground-faint" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="space-y-4">
            <FormFieldSkeleton />
            <div className="grid grid-cols-2 gap-3">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </div>
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap-reverse items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-10 w-64 rounded-md" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-12 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      {/* Table — departments view (default) */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3">
                <Skeleton className="h-2.5 w-16" />
              </th>
              <th className="px-5 py-3">
                <Skeleton className="h-2.5 w-12" />
              </th>
              <th className="px-5 py-3">
                <Skeleton className="h-2.5 w-16" />
              </th>
              <th className="px-5 py-3">
                <Skeleton className="h-2.5 w-14" />
              </th>
              <th className="px-5 py-3 text-right">
                <Skeleton className="h-2.5 w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <Skeleton className="h-3.5 w-40" />
                </td>
                <td className="px-5 py-3">
                  <Skeleton className="h-3 w-12" />
                </td>
                <td className="px-5 py-3">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-5 py-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-5 py-3 text-right">
                  <Skeleton className="h-7 w-24 rounded-md ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DepartmentsAndCoursesLoading;
