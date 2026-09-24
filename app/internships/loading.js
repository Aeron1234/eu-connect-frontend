import PageTitleSkeleton from "@/app/_components/PageTitleSkeleton";
import InternshipPostsSkeleton from "@/app/_components/InternshipPostsSkeleton";

function InternshipsLoading() {
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <InternshipPostsSkeleton />
    </main>
  );
}

export default InternshipsLoading;
