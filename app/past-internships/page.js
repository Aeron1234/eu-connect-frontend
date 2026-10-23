import { Building2 } from "lucide-react";
import PastInternshipsPageContent from "../../components/past-internship-ui/PastInternshipsPageContent";
import PastInternshipPostButton, { PastInternshipsManual } from "../../components/past-internship-ui/PastInternshipPostButton";
import PageTitle from "../../components/ui/PageTitle";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AlumniCompaniesSkeleton from "@/components/skeletons/AlumniCompaniesSkeleton";

async function PastInternshipsPage({ searchParams }) {
  const sParams = await searchParams;
  const yearFilter = sParams.filter || "all";

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Building2}
          title={"Past Internships"}
          description={
            "List of past internships and companies that have accepted interns from our school."
          }
          titleAction={<PastInternshipsManual />}
        />

        <PastInternshipPostButton />
      </div>

      <Suspense fallback={
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Skeleton className="h-10 w-full rounded-md sm:w-64" />
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[10rem_10rem]">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          {Array.from({ length: 5 }, (_, index) => <AlumniCompaniesSkeleton key={index} />)}
        </div>
      }>
        <PastInternshipsPageContent
          yearFilter={yearFilter}
        />
      </Suspense>
    </div>
  );
}

export default PastInternshipsPage;
