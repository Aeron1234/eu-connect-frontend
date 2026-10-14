import { FileText } from "lucide-react";
import SIPPReportsManagerSkeleton from "@/components/skeletons/SIPPReportsManagerSkeleton";

export default function Loading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-emphasis" />
          SIPP Reports
        </h1>
        <p className="text-sm text-foreground-soft mt-1">
          Review SIPP internship placement data and export official CHED annexes as PDFs.
        </p>
      </div>

      <SIPPReportsManagerSkeleton />
    </main>
  );
}
