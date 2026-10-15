import { Skeleton } from "@/components/ui/skeleton";

function ModalFormSkeleton() {
  return (
    <div className="space-y-4 overflow-y-auto p-4 sm:p-6" role="status" aria-label="Loading form options">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-lg sm:h-11" />
        </div>
      ))}
      <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default ModalFormSkeleton;
