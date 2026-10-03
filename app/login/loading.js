import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-18 items-center justify-between border-b border-border px-5 sm:px-8 lg:px-12">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="bg-primary px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-8 w-44 bg-white/20" />
          <Skeleton className="h-16 w-full max-w-2xl bg-white/20" />
          <Skeleton className="h-16 w-2/3 max-w-lg bg-white/20" />
          <Skeleton className="h-24 w-full max-w-xl bg-white/20" />
          <Skeleton className="h-12 w-48 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
