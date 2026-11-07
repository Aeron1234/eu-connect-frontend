import DtrRecordsSkeleton from "@/components/skeletons/DtrRecordsSkeleton";
export default function Loading() { return <main className="space-y-6 p-4 sm:p-6 lg:p-8"><div className="h-8 w-44 animate-pulse rounded bg-muted" /><DtrRecordsSkeleton rows={10} /></main>; }
