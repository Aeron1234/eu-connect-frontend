"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

export default function SummaryReportPrintButton({ internshipId, className = "" }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  if (error) throw error;

  async function printReport() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/summary-report?internshipId=${encodeURIComponent(internshipId)}`, { cache: "no-store" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const failure = new Error(data.error || "Could not generate the report PDF.");
        failure.status = response.status;
        throw failure;
      }
      const url = URL.createObjectURL(await response.blob());
      const tab = window.open(url, "_blank");
      if (!tab) window.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 10 * 60_000);
    } catch (failure) {
      setError(failure instanceof Error ? failure : new Error("Could not generate the report PDF."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button type="button" onClick={printReport} disabled={pending} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto">
        <FileDown className="size-4" aria-hidden="true" />{pending ? "Preparing PDF..." : "Export PDF"}
      </button>
    </div>
  );
}
