"use client";

import { BookOpenText, FileText } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorUI from "@/components/ui/ErrorUI";
import SummaryReportsSkeleton from "@/components/skeletons/SummaryReportsSkeleton";
import ReportContent from "./SummaryReportContent";
import ReportEditor from "./SummaryReportEditor";
import SummaryReportsHelp from "./SummaryReportsHelp";
import SummaryReportsToolbar from "./SummaryReportsToolbar";
import useStudentSummaryReports from "./useStudentSummaryReports";
import useInternshipStartAccess from "@/components/ui/useInternshipStartAccess";
import InternshipStartNotice from "@/components/ui/InternshipStartNotice";

export default function StudentSummaryReportsPage() {
  const {
    reports,
    records,
    record,
    setSelectedId,
    editing,
    setEditing,
    confirmingDelete,
    setConfirmingDelete,
    deleteMutation,
    handleDelete,
  } = useStudentSummaryReports();
  const startAccess = useInternshipStartAccess(record?.date_started, "Summary reports");

  if (reports.isPending) return <SummaryReportsSkeleton />;
  if (reports.isError && !reports.data) return <ErrorUI error={reports.error} reset={() => reports.refetch()} logError={false} />;

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageTitle Icon={BookOpenText} title="Summary Reports" description="Reflect on your complete internship experience in one report per internship." titleAction={Boolean(record) && (
        <SummaryReportsHelp />
      )} />
    
      {!record ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <FileText className="mx-auto size-9 text-primary-emphasis" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">No eligible internship yet</h2>
          <p className="mt-1 text-sm text-foreground-soft">Your approved ongoing or finished internship will appear here when it is ready for a summary report.</p>
        </section>
      ) : (
        <>
          <SummaryReportsToolbar
            record={record}
            records={records}
            editing={editing && startAccess.allowed}
            canEdit={startAccess.allowed}
            setSelectedId={setSelectedId}
            setEditing={setEditing}
            setConfirmingDelete={setConfirmingDelete}
          />
          {!startAccess.allowed && <InternshipStartNotice message={startAccess.message} />}
          <ConfirmDialog
            open={confirmingDelete}
            onOpenChange={setConfirmingDelete}
            title="Delete summary report?"
            description={`Delete the summary report for ${record.company_name}? Its attachment will also be removed. You can create a new report afterward.`}
            confirmLabel="Delete report"
            pending={deleteMutation.isPending}
            onConfirm={() => void handleDelete()}
          />
          {startAccess.allowed && (!record.report_id || editing) ? (
            <ReportEditor
              key={record.internship_id}
              record={record}
              onCancel={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : record.report_id ? (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground-soft"><FileText className="size-4 text-primary-emphasis" aria-hidden="true" />Submitted summary report for <span className="font-semibold text-foreground">{record.company_name}</span><span className="w-full pl-6 text-xs">Prepared by {record.student_name || "Student"}</span></div>
              <ReportContent record={record} />
            </>
          ) : null}
        </>
      )}
    </main>
  );
}
