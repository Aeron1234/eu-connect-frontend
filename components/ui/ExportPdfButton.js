"use client";

import { Spinner } from "@/components/ui/spinner";
import { FileDown } from "lucide-react";
import { useState } from "react";

export default function ExportPdfButton({
  endpoint, // e.g. "/api/reports/annex-d" or "/api/reports/annex-c"
  params = {}, // e.g. { companyKey, academicYear } or { reportId }
  label = "Export PDF",
}) {
  const [isPending, setIsPending] = useState(false);
  const [requestError, setRequestError] = useState(null);

  // Event-handler errors do not reach Next.js error boundaries. Throw on the
  // next render so the page's existing themed error UI can handle the failure.
  if (requestError) throw requestError;

  const handleExport = async () => {
    try {
      setIsPending(true);

      const query = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
      ).toString();

      const res = await fetch(`${endpoint}?${query}`);
      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: "Failed to generate PDF" }));
        const requestFailure = new Error(error || `PDF export failed (${res.status}).`);
        requestFailure.status = res.status;
        throw requestFailure;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      setRequestError(err instanceof Error ? err : new Error("Could not generate the PDF."));
    } finally {
      setIsPending(false);
    }
  };

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
