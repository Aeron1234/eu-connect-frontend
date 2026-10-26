"use client";
import useExportPdf from "../ui/useExportPdf";

// Adapt the shared PDF preview/export hook to one internship's summary report.
// The legacy printReport name opens preview; printing/downloading happens in that modal.
export default function useSummaryReportPdf(internshipId) {
  const { isPending, handleExport } = useExportPdf({ endpoint: "/api/reports/summary-report", params: { internshipId }, filename: `summary-report-${internshipId}.pdf` });
  return { pending: isPending, printReport: handleExport };
}
