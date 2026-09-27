import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import InternshipRecordFormHeaderSkeleton from "./InternshipRecordFormHeaderSkeleton";

function FieldSkeleton({ labelWidth = "w-24" }) {
  return (
    <div>
      <Skeleton className={`h-2.5 ${labelWidth} mb-1.5`} />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

function InternshipRecordFormSkeleton() {
  return (
    <>
      <InternshipRecordFormHeaderSkeleton />

      <div className="flex flex-col gap-5 sm:gap-6 mt-5">
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6">
          <FieldSkeleton labelWidth="w-28" />
          <FieldSkeleton labelWidth="w-16" />
        </div>

        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6">
          <FieldSkeleton labelWidth="w-16" />
          <FieldSkeleton labelWidth="w-40" />
        </div>

        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6">
          <FieldSkeleton labelWidth="w-20" />
          <FieldSkeleton labelWidth="w-28" />
        </div>

        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6">
          <FieldSkeleton labelWidth="w-16" />
          <FieldSkeleton labelWidth="w-28" />
        </div>

        <div>
          <Skeleton className="h-2.5 w-24 mb-1.5" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0 text-stone-300" />
              <Skeleton className="h-3 w-40" />
            </span>
            <Skeleton className="h-3 w-full max-w-md" />
          </div>

          <Skeleton className="h-[320px] w-full rounded-lg" />

          <div>
            <Skeleton className="h-2.5 w-28 mb-1.5" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        </div>

        <Skeleton className="h-11 w-full sm:w-56 rounded-md self-end" />
      </div>
    </>
  );
}

export default InternshipRecordFormSkeleton;
