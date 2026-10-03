import { Skeleton } from "@/components/ui/skeleton";

function FieldSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-24 mb-1.5" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

function CreateAccountFormSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>

      <div className="h-full flex items-end justify-end mt-4">
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export default CreateAccountFormSkeleton;
