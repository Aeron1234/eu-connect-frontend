import { withReadErrorPage } from "@/lib/page-read-error";
import RecordsDetailsPageContent from "@/components/internship-records-ui/RecordsDetailsPageContent";
import RecordsHeader from "@/components/internship-records-ui/RecordsHeader";
import { getInternshipRecordOverview } from "@/lib/server-actions/internship-records-actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

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

export const dynamic = "force-dynamic";

async function InternshipRecordsDetailsPage({ params }) {
  const resolvedParams = await params;

  const internshipId = resolvedParams.internshipId
    ? decodeURIComponent(resolvedParams.internshipId)
    : null;

  const overviewData = internshipId
    ? await getInternshipRecordOverview(internshipId)
    : null;

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href={`/internship-records`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to records
      </Link>

      <RecordsHeader record={overviewData || {}} internshipId={internshipId} />

      <RecordsDetailsPageContent
        record={overviewData || {}}
        internshipId={internshipId}
      />
    </div>
  );
}

export default withReadErrorPage(InternshipRecordsDetailsPage);
