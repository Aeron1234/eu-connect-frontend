import RecordsPageContent from "@/app/_components/RecordsPageContent";
import { getDepartmentInternshipRecords } from "@/app/_services/dept-head-actions";

export const metadata = {
  title: "Internship Records",
};

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

export default InternshipRecordsPage;
