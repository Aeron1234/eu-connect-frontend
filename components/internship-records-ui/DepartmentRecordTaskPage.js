import Link from "next/link";
import { ChevronLeft, Building2 } from "lucide-react";
import { notFound } from "next/navigation";
import RecordsDetailsPageContent from "./RecordsDetailsPageContent";
import HelpManual from "@/components/help-ui/HelpManual";
import { getInternshipRecordOverview } from "@/lib/server-actions/internship-records-actions";

const task = {
  attendance: { title: "Attendance", back: "/department_head/attendance", tab: "dtr" },
  submissions: { title: "Student Submissions", back: "/department_head/submissions", tab: "narratives" },
  evaluations: { title: "Evaluations", back: "/department_head/evaluations", tab: "evaluations" },
};

// Task details share the record's authorized data readers, but lifecycle actions
// stay on the placement overview in Internship Records.
export default async function DepartmentRecordTaskPage({ internshipId, mode, initialTab, evaluationId }) {
  const config = task[mode];
  if (!config || !internshipId) notFound();
  const record = await getInternshipRecordOverview(internshipId);
  if (!record) notFound();
  return <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
    <Link href={config.back} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" />Back to {config.title.toLowerCase()}</Link>
    <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-emphasis">{config.title}</p>
        <div className="mt-1 flex items-center gap-2"><h1 className="break-words text-xl font-bold sm:text-2xl">{record.student_name}</h1><HelpManual guideId={`department-${mode}`} /></div>
        <p className="mt-1 flex items-start gap-2 break-words text-sm text-muted-foreground"><Building2 className="mt-0.5 size-4 shrink-0" />{record.internship_position} at {record.company_name}</p>
      </div>
      <Link href={`/department_head/internship-records/${encodeURIComponent(internshipId)}`} className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">View placement overview</Link>
    </header>
    <RecordsDetailsPageContent key={`${internshipId}:${initialTab || config.tab}:${evaluationId || ""}`} record={record} internshipId={internshipId} mode={mode} initialTab={initialTab || config.tab} initialEvaluationId={evaluationId || null} />
  </main>;
}
