import { Skeleton } from "@/components/ui/skeleton";
import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import CreateAccountFormSkeleton from "@/components/skeletons/CreateAccountFormSkeleton";

function CreateAccountLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitleSkeleton />

      <div className="space-y-6">
        <div className="flex rounded-lg bg-secondary p-1 w-fit gap-1">
          <Skeleton className="h-9 w-16 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>

        <CreateAccountFormSkeleton />
      </div>
    </main>
  );
}

export default CreateAccountLoading;
