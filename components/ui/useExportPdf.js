"use client";

import { useState } from "react";
import { downloadPdf } from "./downloadPdf";

export default function useExportPdf({ endpoint, params }) {
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
        const { error, code } = await res
          .json()
          .catch(() => ({ error: "Failed to generate PDF" }));
        const requestFailure = new Error(error || `PDF export failed (${res.status}).`);
        requestFailure.status = res.status;
        requestFailure.code = code;
        throw requestFailure;
      }

      await downloadPdf(res);
    } catch (err) {
      setRequestError(err instanceof Error ? err : new Error("Could not generate the PDF."));
    } finally {
      setIsPending(false);
    }
  };
  return { isPending, handleExport };
}
