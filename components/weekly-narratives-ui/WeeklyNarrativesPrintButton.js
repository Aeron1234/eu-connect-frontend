"use client";

import { FileDown } from "lucide-react";
import useExportPdf from "../ui/useExportPdf";

export default function WeeklyNarrativesPrintButton({ internshipId, className = "" }) {
  const { isPending: pending, handleExport: printNarratives } = useExportPdf({ endpoint: "/api/reports/weekly-narratives", params: { internshipId }, filename: `weekly-narratives-${internshipId}.pdf` });

  return <div className={className}>
    <button type="button" onClick={printNarratives} disabled={pending} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto">
      <FileDown className="size-4" aria-hidden="true" />{pending ? "Preparing PDF..." : "Export PDF"}
    </button>
  </div>;
}
