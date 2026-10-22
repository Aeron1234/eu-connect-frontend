"use client";

import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import ErrorUI from "./ErrorUI";

function LoadingPdf({ preparing = false }) {
  return <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
    <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
    <p>{preparing ? "Preparing your PDF…" : "Loading PDF viewer…"}</p>
  </div>;
}
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false, loading: () => <LoadingPdf /> });

export default function PdfPreviewDialog({ state, onClose, onRetry }) {
  if (!state.open) return null;
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="flex h-dvh max-h-dvh w-full max-w-full flex-col gap-0 rounded-none p-0 sm:h-[92dvh] sm:max-h-[92dvh] sm:max-w-[min(1100px,calc(100%_-_2rem))] sm:rounded-xl">
      <div className="shrink-0 border-b border-border px-4 py-4 pr-12 sm:px-5">
        <DialogTitle className="text-base">PDF preview</DialogTitle>
        <DialogDescription className="mt-1 truncate text-xs">{state.filename}</DialogDescription>
      </div>
      {state.status === "loading" && <LoadingPdf preparing />}
      {state.status === "error" && <div className="min-h-0 flex-1 overflow-auto p-4"><ErrorUI error={state.error} reset={onRetry} compact logError={false} /></div>}
      {state.document && <PdfViewer key={state.document.url} file={state.document} />}
    </DialogContent>
  </Dialog>;
}
