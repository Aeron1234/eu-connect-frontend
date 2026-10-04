import { withReadErrorPage } from "@/lib/page-read-error";
import RecordsPageContent from "@/components/internship-records-ui/RecordsPageContent";
import { getDepartmentInternshipRecords } from "@/lib/server-actions/internship-records-actions";

export const metadata = {
  title: "Internship Records",
};

export const dynamic = "force-dynamic";

async function InternshipRecordsPage({ searchParams }) {
  const internshipRecordsData = await getDepartmentInternshipRecords({});

  const sParams = await searchParams;
  const filter = sParams.filter || "all";

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <RecordsPageContent
        initialData={internshipRecordsData?.data || []}
        stats={internshipRecordsData?.stats || {}}
        pagination={internshipRecordsData?.pagination || {}}
        filter={filter}
      />
    </main>
  );
}

export default withReadErrorPage(InternshipRecordsPage);
