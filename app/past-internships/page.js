import { Building2 } from "lucide-react";
import PastInternshipsPageContent from "../../components/past-internship-ui/PastInternshipsPageContent";
import PastInternshipPostButton from "../../components/past-internship-ui/PastInternshipPostButton";
import PageTitle from "../../components/ui/PageTitle";
import { Suspense } from "react";

async function PastInternshipsPage({ searchParams }) {
  const sParams = await searchParams;
  const yearFilter = sParams.filter || "all";

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

        <PastInternshipPostButton />
      </div>

      <Suspense fallback={<div>...</div>}>
        <PastInternshipsPageContent
          yearFilter={yearFilter}
        />
      </Suspense>
    </main>
  );
}

export default PastInternshipsPage;
