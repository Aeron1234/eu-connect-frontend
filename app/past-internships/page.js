import { Building2 } from "lucide-react";
import PastInternshipsPageContent from "../_components/PastInternshipsPageContent";
import PastInternshipPostButton from "../_components/PastInternshipPostButton";
import { getAlumniInternships } from "../_services/dept-head-actions";
import { getCourses } from "../_services/services";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import PageTitle from "../_components/PageTitle";

export const dynamic = "force-dynamic";

async function PastInternshipsPage({ searchParams }) {
  const sParams = await searchParams;
  const yearFilter = sParams.filter || "all";

  const [pastInternshipsData, courses] = await Promise.all([
    getAlumniInternships({
      academicYear: yearFilter !== "all" ? yearFilter : undefined,
    }),
    getCourses(),
  ]);

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Building2}
          title={"Past Internships"}
          description={
            "List of past internships and companies that have accepted interns from our school."
          }
        />

        <PastInternshipPostButton courses={courses || []} />
      </div>

      <Suspense
        fallback={
          <div className="self-center justify-self-center p-5">
            <span className="sr-only">Loading notifications...</span>
            <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
          </div>
        }
      >
        <PastInternshipsPageContent
          initialData={pastInternshipsData?.data || []}
          academicYears={pastInternshipsData?.academicYears || []}
          pagination={pastInternshipsData?.pagination || {}}
          yearFilter={yearFilter}
          courses={courses || []}
        />
      </Suspense>
    </main>
  );
}

export default PastInternshipsPage;
