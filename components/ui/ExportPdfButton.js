"use client";

import { Spinner } from "@/components/ui/spinner";
import { Printer } from "lucide-react";
import { useState } from "react";

export default function ExportPdfButton({
  endpoint, // e.g. "/api/reports/annex-d" or "/api/reports/annex-c"
  params = {}, // e.g. { companyKey, academicYear } or { reportId }
  label = "Print",
}) {
  const [isPending, setIsPending] = useState(false);

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
        throw new Error(error);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong generating the PDF.");
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
          <Printer className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
