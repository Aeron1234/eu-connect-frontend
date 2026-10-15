"use client";

import { Spinner } from "@/components/ui/spinner";
import { FileDown } from "lucide-react";
import useExportPdf from "./useExportPdf";

export default function ExportPdfButton({
  endpoint, // e.g. "/api/reports/annex-d" or "/api/reports/annex-c"
  params = {}, // e.g. { companyKey, academicYear } or { reportId }
  label = "Export PDF",
}) {
  const { isPending, handleExport } = useExportPdf({ endpoint, params });

  return (
    <button
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
