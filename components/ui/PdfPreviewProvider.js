"use client";

import { createContext, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { createPdfPreviewController } from "./pdfPreviewController.mjs";
import { createDocumentPreviewController } from "./documentPreviewController.mjs";
import PdfPreviewDialog from "./PdfPreviewDialog";
import DocumentPreviewDialog from "./DocumentPreviewDialog";

const PreviewContext = createContext(null);

function PdfPreviewHost({ ref }) {
  const [controller] = useState(() => createPdfPreviewController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  useImperativeHandle(ref, () => controller, [controller]);
  useEffect(() => () => controller.close(), [controller]);
  return <PdfPreviewDialog state={state} onClose={controller.close} onRetry={controller.retry} />;
}
function DocumentPreviewHost({ ref }) {
  const [controller] = useState(() => createDocumentPreviewController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  useImperativeHandle(ref, () => controller, [controller]);
  useEffect(() => () => controller.close(), [controller]);
  return <DocumentPreviewDialog state={state} onClose={controller.close} onRetry={controller.retry} />;
}

export function PdfPreviewProvider({ children }) {
  const host = useRef(null), documentHost = useRef(null);
  // Hosts are keyed by pathname below. Navigation remounts them and their cleanup
  // closes pending reads and releases preview state.
  const pathname = usePathname();
  // Only one preview host is open at a time; switching type closes the previous read.
  const previewPdf = useCallback(request => {
    documentHost.current?.close();
    return host.current?.open(request) ?? Promise.resolve(false);
  }, []);
  const previewDocument = useCallback(request => {
    host.current?.close();
    return documentHost.current?.open(request) ?? Promise.resolve(false);
  }, []);
  const value = useMemo(() => ({ previewPdf, previewDocument }), [previewPdf, previewDocument]);
  return <PreviewContext.Provider value={value}>
    {children}
    <PdfPreviewHost key={pathname} ref={host} />
    <DocumentPreviewHost key={pathname + ":document"} ref={documentHost} />
  </PreviewContext.Provider>;
}

// Access previewPdf/previewDocument from a surrounding PdfPreviewProvider.
// Loaders read authorized bytes on demand; the provider owns modal state and cancellation.
export function usePdfPreview() {
  const context = useContext(PreviewContext);
  if (!context) throw new Error("Document preview must be used within PdfPreviewProvider.");
  return context;
}
