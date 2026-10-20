import PageTitleSkeleton from "@/components/skeletons/PageTitleSkeleton";
import InternshipPostsSkeleton from "@/components/skeletons/InternshipPostsSkeleton";

function InternshipsLoading() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitleSkeleton />
      </div>

      <InternshipPostsSkeleton />
    </div>
  );
}

export default InternshipsLoading;
