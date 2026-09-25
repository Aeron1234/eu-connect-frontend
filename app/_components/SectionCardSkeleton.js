import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";

function SectionCardSkeleton({ rows = 3 }) {
  return (
    <section className="rounded-xl border border-stone-300 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 sm:px-5 py-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardList className="h-4 w-4 flex-shrink-0 text-stone-300" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </header>

      <ul className="divide-y divide-stone-200">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 px-4 sm:px-5 py-3">
            <Skeleton className="h-3.5 flex-1 max-w-sm" />
            <Skeleton className="h-7 w-7 rounded-md flex-shrink-0" />
          </li>
        ))}
      </ul>

      <div className="border-t border-stone-200 px-4 sm:px-5 py-3">
        <Skeleton className="h-3.5 w-28" />
      </div>
    </section>
  );
}

export default SectionCardSkeleton;
