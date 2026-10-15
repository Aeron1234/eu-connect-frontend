"use client";

import { useState } from "react";
import { openPdfBlob } from "../ui/openPdfBlob";

export default function useSummaryReportPdf(internshipId) {
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
        failure.code = data.code;
        throw failure;
      }
      openPdfBlob(await response.blob());
    } catch (failure) {
      setError(failure instanceof Error ? failure : new Error("Could not generate the report PDF."));
    } finally {
      setPending(false);
    }
  }
  return { pending, printReport };
}
