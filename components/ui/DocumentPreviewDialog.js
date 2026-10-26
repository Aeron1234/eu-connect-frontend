"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import ErrorUI from "./ErrorUI";

const loading = <div role="status" className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />Preparing document preview...</div>;
const OfficeViewer = dynamic(() => import("./OfficeViewer"), { ssr: false, loading: () => loading });

export default function DocumentPreviewDialog({ state, onClose, onRetry }) {
  const [downloading, setDownloading] = useState(false), [downloadError, setDownloadError] = useState("");
  const downloadRequest = useRef(null);
  useEffect(() => {
    setDownloading(false); setDownloadError("");
    return () => { downloadRequest.current?.abort(); downloadRequest.current = null; };
  }, [state.open, state.filename]);
  // On read failure, original download is a separate explicit action with its own
  // abort/deadline state; a preview error never starts a download automatically.
  async function downloadOriginal() {
    if (downloadRequest.current || !state.downloadOriginal) return;
    const abort = new AbortController(); downloadRequest.current = abort;
    setDownloading(true); setDownloadError("");
    const timer = setTimeout(() => abort.abort(new Error("Download timed out. Please try again.")), 45_000);
    try { await state.downloadOriginal(abort.signal); }
    catch { if (downloadRequest.current === abort) setDownloadError("Could not download the original file. Please try again."); }
    finally { clearTimeout(timer); if (downloadRequest.current === abort) { downloadRequest.current = null; setDownloading(false); } }
  }
  if (!state.open) return null;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="flex h-dvh max-h-dvh w-full max-w-full flex-col gap-0 rounded-none p-0 sm:h-[92dvh] sm:max-h-[92dvh] sm:max-w-[min(1100px,calc(100%_-_2rem))] sm:rounded-xl">
      <div className="shrink-0 border-b border-border px-4 py-4 pr-12 sm:px-5">
        <DialogTitle className="text-base">Document preview</DialogTitle>
        <DialogDescription className="mt-1 truncate text-xs">{state.filename}</DialogDescription>
      </div>
      {state.status === "loading" && loading}
      {state.status === "error" && <div className="min-h-0 flex-1 overflow-auto p-4">
        <ErrorUI error={state.error} reset={onRetry} compact logError={false} />
        {state.downloadOriginal && <button type="button" onClick={downloadOriginal} disabled={downloading} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{downloading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}Download original file</button>}
        {downloadError && <p role="alert" className="mt-2 text-xs text-primary-emphasis">{downloadError}</p>}
      </div>}
      {state.document && <OfficeViewer file={state.document} />}
    </DialogContent>
  </Dialog>;
}
