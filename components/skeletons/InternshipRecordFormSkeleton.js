import { Skeleton } from "@/components/ui/skeleton";
import InternshipRecordFormHeaderSkeleton from "./InternshipRecordFormHeaderSkeleton";

function FieldSkeleton() {
  return <div className="min-w-0 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-11 w-full rounded-lg" /></div>;
}

function SectionSkeleton({ children }) {
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-7 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-36 max-w-full" /><Skeleton className="h-3 w-80 max-w-full" /></div>
      </div>
      {children}
    </div>
  );
}

export default function InternshipRecordFormSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-hidden="true">
      <div className="p-5 sm:p-6"><InternshipRecordFormHeaderSkeleton /></div>
      <div className="grid min-w-0 border-t border-border xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-7 p-5 sm:space-y-8 sm:p-6 lg:p-7">
          {[0, 1].map((section) => <div key={section} className={section ? "border-t border-border pt-7 sm:pt-8" : ""}>
            <SectionSkeleton><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">{[0, 1, 2, 3].map((field) => <FieldSkeleton key={field} />)}</div></SectionSkeleton>
          </div>)}
          <div className="border-t border-border pt-7 sm:pt-8"><SectionSkeleton><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-32 w-full rounded-lg" /></div></SectionSkeleton></div>
          <div className="border-t border-border pt-7 sm:pt-8"><SectionSkeleton>
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-[min(320px,55vh)] w-full rounded-lg" />
            <div className="grid gap-4 sm:grid-cols-2"><FieldSkeleton /><FieldSkeleton /></div>
            <Skeleton className="h-3 w-full max-w-md" />
            <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-20 w-full rounded-lg" /></div>
          </SectionSkeleton></div>
        </div>
        <div className="min-w-0 border-t border-border bg-muted/20 p-5 sm:p-6 xl:border-l xl:border-t-0">
          <Skeleton className="h-3 w-32" />
          <div className="mt-5 flex items-center gap-3 xl:block"><Skeleton className="size-12 shrink-0 rounded-2xl xl:size-14" /><div className="space-y-2 xl:mt-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-28" /></div></div>
          <div className="mt-6 space-y-5 border-t border-border pt-5">{[0, 1, 2, 3, 4].map((row) => <div key={row} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-36 max-w-full" /></div>)}</div>
          <Skeleton className="mt-6 h-28 w-full rounded-xl" />
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Skeleton className="h-3 w-72 max-w-full" /><Skeleton className="h-11 w-full shrink-0 rounded-lg sm:w-60" />
      </div>
    </div>
  );
}
