import { Building2 } from "lucide-react";
import PastInternshipsPageContent from "../_components/PastInternshipsPageContent";
import PastInternshipPostButton from "../_components/PastInternshipPostButton";
import { getAlumniInternships } from "../_services/dept-head-actions";
import { getCourses } from "../_services/services";

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-500" />
            Past Internships
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            List of past internships and companies that have accepted interns
            from our school.
          </p>
        </div>

        <PastInternshipPostButton courses={courses || []} />
      </div>

      <PastInternshipsPageContent
        initialData={pastInternshipsData?.data || []}
        academicYears={pastInternshipsData?.academicYears || []}
        pagination={pastInternshipsData?.pagination || {}}
        yearFilter={yearFilter}
      />
    </main>
  );
}

export default PastInternshipsPage;
