import { Skeleton } from "@/components/ui/skeleton";

function ModalFormSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading form options">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="ml-auto h-10 w-28 rounded-md" />
    </div>
  );
}

export default ModalFormSkeleton;
