"use client";

import { useRef, useState } from "react";
import { usePdfPreview } from "./PdfPreviewProvider";

export default function useExportPdf({ endpoint, params = {}, filename = "report.pdf" }) {
  const [isPending, setIsPending] = useState(false);
  const busy = useRef(false);
  const { previewPdf } = usePdfPreview();
  const handleExport = async () => {
    if (busy.current) return;
    busy.current = true; setIsPending(true);
    try {
      const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null)).toString();
      await previewPdf({ filename, load: (signal) => fetch(`${endpoint}?${query}`, { cache: "no-store", signal }) });
    } finally { busy.current = false; setIsPending(false); }
  };
  return { isPending, handleExport };
}
