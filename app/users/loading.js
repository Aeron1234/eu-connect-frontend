import { Skeleton } from "@/components/ui/skeleton";
import { History, Search } from "lucide-react";
import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import UserCardSkeleton from "@/app/_components/UserCardSkeleton";

function UsersLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitleSkeleton hasIcon={false} />

      <div className="w-full flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2 border border-border bg-card rounded-lg px-2 py-2.5">
          <Search className="w-4 h-4 text-foreground-faint" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-2 justify-between text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <History className="h-4 w-4 text-primary-300" />
            <Skeleton className="h-3.5 w-28" />
          </span>
          <Skeleton className="h-3 w-14" />
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default UsersLoading;
