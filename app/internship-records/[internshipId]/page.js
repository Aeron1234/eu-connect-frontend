import RecordsDetailsPageContent from "@/app/_components/RecordsDetailsPageContent";
import RecordsHeader from "@/app/_components/RecordsHeader";
import { getInternshipRecordOverview } from "@/app/_services/dept-head-actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const internshipId = resolvedParams.internshipId
    ? decodeURIComponent(resolvedParams.internshipId)
    : null;

  if (!internshipId) return { title: "Internship Records" };

  const summaryData = await getInternshipRecordOverview(internshipId);
  if (summaryData) {
    return {
      title: `${summaryData.student_name} - Internship Record`,
    };
  }

  return { title: "Internship Record" };
}

async function InternshipRecordsDetailsPage({ params }) {
  const resolvedParams = await params;

  const internshipId = resolvedParams.internshipId
    ? decodeURIComponent(resolvedParams.internshipId)
    : null;

  const overviewData = internshipId
    ? await getInternshipRecordOverview(internshipId)
    : null;

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href={`/internship-records`}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to records
      </Link>

      <RecordsHeader record={overviewData || {}} internshipId={internshipId} />

      <RecordsDetailsPageContent
        record={overviewData || {}}
        internshipId={internshipId}
      />
    </main>
  );
}

export default InternshipRecordsDetailsPage;
