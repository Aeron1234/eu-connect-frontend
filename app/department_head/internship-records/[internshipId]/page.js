import { withReadErrorPage } from "@/lib/page-read-error";
import RecordsDetailsPageContent from "@/components/internship-records-ui/RecordsDetailsPageContent";
import RecordsHeader from "@/components/internship-records-ui/RecordsHeader";
import { getInternshipRecordOverview } from "@/lib/server-actions/internship-records-actions";
import { ChevronLeft, ClipboardClock, FileText, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { departmentRecordDestination } from "@/lib/department-record-navigation";

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

async function InternshipRecordsDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const query = await searchParams;

  const internshipId = resolvedParams.internshipId
    ? decodeURIComponent(resolvedParams.internshipId)
    : null;

  if (["dtr", "narratives", "summary-report", "documents", "evaluations"].includes(query?.tab)) {
    redirect(departmentRecordDestination(internshipId, query));
  }

  const overviewData = internshipId
    ? await getInternshipRecordOverview(internshipId)
    : null;

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href="/department_head/internship-records"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to records
      </Link>

      <RecordsHeader record={overviewData || {}} internshipId={internshipId} />

      <nav aria-label="Review student work" className="flex flex-wrap gap-2">
        <Link href={`/department_head/attendance/${encodeURIComponent(internshipId)}`} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"><ClipboardClock className="size-4" />Attendance</Link>
        <Link href={`/department_head/submissions/${encodeURIComponent(internshipId)}`} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"><FileText className="size-4" />Student Submissions</Link>
        <Link href={`/department_head/evaluations/${encodeURIComponent(internshipId)}`} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"><ClipboardCheck className="size-4" />Evaluations</Link>
      </nav>

      <RecordsDetailsPageContent
        key={`${internshipId}:${query?.tab === "rotations" ? "rotations" : "overview"}`}
        record={overviewData || {}}
        internshipId={internshipId}
        initialTab={query?.tab === "rotations" ? "rotations" : "overview"}
      />
    </div>
  );
}

export default withReadErrorPage(InternshipRecordsDetailsPage);
