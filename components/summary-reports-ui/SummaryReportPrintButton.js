"use client";

import { useState } from "react";
import { Printer } from "lucide-react";

export default function SummaryReportPrintButton({ internshipId, className = "" }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function printReport() {
    const tab = window.open("", "_blank");
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/reports/summary-report?internshipId=${encodeURIComponent(internshipId)}`, { cache: "no-store" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate the report PDF.");
      }
      const url = URL.createObjectURL(await response.blob());
      if (tab) tab.location.href = url;
      else window.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 10 * 60_000);
    } catch (failure) {
      tab?.close();
      setError(failure.message || "Could not generate the report PDF.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button type="button" onClick={printReport} disabled={pending} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto">
        <Printer className="size-4" aria-hidden="true" />{pending ? "Preparing PDF..." : "Print"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}
