"use client";
import useExportPdf from "../ui/useExportPdf";

export default function useSummaryReportPdf(internshipId) {
  const { isPending, handleExport } = useExportPdf({ endpoint: "/api/reports/summary-report", params: { internshipId }, filename: `summary-report-${internshipId}.pdf` });
  return { pending: isPending, printReport: handleExport };
}
