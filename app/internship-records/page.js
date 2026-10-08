import RecordsPageContent from "@/components/internship-records-ui/RecordsPageContent";

export const metadata = {
  title: "Internship Records",
};

async function InternshipRecordsPage({ searchParams }) {
  const sParams = await searchParams;
  const filter = sParams.filter || "all";

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <RecordsPageContent
        filter={filter}
      />
    </main>
  );
}

export default InternshipRecordsPage;
