import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

function InternshipsByDepartmentChartSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <Briefcase className="w-4 h-4 text-primary-500" />
          Internships by Department
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ongoing internships across all departments
        </p>
      </div>

      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default InternshipsByDepartmentChartSkeleton;
