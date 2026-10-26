"use client";

import { useRef, useState } from "react";
import { usePdfPreview } from "./PdfPreviewProvider";

// Open a generated report in the shared PDF preview provider. Return a pending flag and
// handleExport; callers supply endpoint/query values and the suggested download filename.
export default function useExportPdf({ endpoint, params = {}, filename = "report.pdf" }) {
  const [isPending, setIsPending] = useState(false);
  // Block duplicate export clicks synchronously while React's pending state updates.
  const busy = useRef(false);
  const { previewPdf } = usePdfPreview();
  const handleExport = async () => {
    if (busy.current) return;
    busy.current = true; setIsPending(true);
    try {
      const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null)).toString();
      // Export opens a preview first. Download/print are explicit actions in that modal.
      await previewPdf({ filename, load: (signal) => fetch(`${endpoint}?${query}`, { cache: "no-store", signal }) });
    } finally { busy.current = false; setIsPending(false); }
  };
  return { isPending, handleExport };
}
