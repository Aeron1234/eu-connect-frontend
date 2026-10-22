"use client";

import { createContext, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { createPdfPreviewController } from "./pdfPreviewController.mjs";
import PdfPreviewDialog from "./PdfPreviewDialog";

const PreviewContext = createContext(null);

function PdfPreviewHost({ ref }) {
  const [controller] = useState(() => createPdfPreviewController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  useImperativeHandle(ref, () => controller, [controller]);
  // Closing or navigating away aborts pending reads and releases private data.
  useEffect(() => () => controller.close(), [controller]);
  return <PdfPreviewDialog state={state} onClose={controller.close} onRetry={controller.retry} />;
}

export function PdfPreviewProvider({ children }) {
  const host = useRef(null);
  const pathname = usePathname();
  const previewPdf = useCallback((request) => host.current?.open(request) ?? Promise.resolve(false), []);
  const value = useMemo(() => ({ previewPdf }), [previewPdf]);
  return <PreviewContext.Provider value={value}>
    {children}
    <PdfPreviewHost key={pathname} ref={host} />
  </PreviewContext.Provider>;
}

export function usePdfPreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error("PDF preview must be used within PdfPreviewProvider.");
  return context;
}
