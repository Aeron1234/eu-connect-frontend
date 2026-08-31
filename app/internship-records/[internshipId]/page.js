import RecordsDetailsPageContent from "@/app/_components/RecordsDetailsPageContent";
import RecordsHeader from "@/app/_components/RecordsHeader";
import { getInternshipRecordOverview } from "@/app/_services/dept-head-actions";
import { getUserSession } from "@/src-copies/services";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const detailTabs = [
  { label: "Overview", value: "overview" },
  { label: "DTR", value: "dtr" },
  { label: "Narratives", value: "narratives" },
  { label: "Evaluations", value: "evaluations" },
  { label: "Documents", value: "documents" },
];

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

async function InternshipRecordsDetailsPage({ params, searchParams }) {
  const resolvedParams = await params;
  const sParams = await searchParams;

  const internshipId = resolvedParams.internshipId
    ? decodeURIComponent(resolvedParams.internshipId)
    : null;

  const overviewData = internshipId
    ? await getInternshipRecordOverview(internshipId)
    : null;

  const filter = sParams.filter || "overview";

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href={`/internship-records`}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Back to records
      </Link>

      <RecordsHeader record={overviewData || {}} internshipId={internshipId} />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-background p-1.5">
        {detailTabs.map((t) => (
          <Link
            key={t.value}
            href={`/internship-records/${internshipId}?filter=${t.value}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === t.value
                ? "bg-primary-500 text-primary-foreground"
                : "text-foreground/70 hover:text-primary-500"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <RecordsDetailsPageContent
        record={overviewData || {}}
        filter={filter}
        internshipId={internshipId}
      />
    </main>
  );
}

export default InternshipRecordsDetailsPage;
