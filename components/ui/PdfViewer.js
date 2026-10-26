"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Download, LoaderCircle, Printer, ZoomIn, ZoomOut } from "lucide-react";
import { downloadPdfBlob } from "./downloadPdf";
import { printPdfDocument } from "./printPdfDocument.mjs";
import ErrorUI from "./ErrorUI";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Use locally prepared assets matching this PDF.js version, including fallback fonts.
const assetRoot = `/pdfjs/${pdfjs.version}/`;
pdfjs.GlobalWorkerOptions.workerSrc = `${assetRoot}pdf.worker.min.mjs`;
const options = { cMapUrl: `${assetRoot}cmaps/`, cMapPacked: true, standardFontDataUrl: `${assetRoot}standard_fonts/`, wasmUrl: `${assetRoot}wasm/`, iccUrl: `${assetRoot}iccs/`, isEvalSupported: false };
const buttonClass = "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";
const busy = <p role="status" className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Loading page…</p>;

export default function PdfViewer({ file }) {
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  // Start at 75% of the available preview width; print uses the PDF's own page sizes.
  const [zoom, setZoom] = useState(.75);
  const [width, setWidth] = useState(280);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState("");
  const [actionError, setActionError] = useState(null);
  const area = useRef(null);
  const printingRequest = useRef(null);
  const printingCleanup = useRef(null);
  useEffect(() => {
    const element = area.current;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(160, Math.floor(entry.contentRect.width - 32))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => { printingRequest.current?.abort(); printingCleanup.current?.(); }, []);

  async function print() {
    if (!pdf || printingRequest.current) return;
    printingCleanup.current?.();
    const request = printingRequest.current = new AbortController();
    setPrinting(true); setActionError(null);
    // Serialize print preparation and reuse the loaded PDF rather than exporting again.
    try { printingCleanup.current = await printPdfDocument(pdf, { signal: request.signal, title: file.filename, onProgress: (page, total) => setPrintProgress(`Preparing page ${page} of ${total}…`) }); }
    catch (failure) { if (!request.signal.aborted) setActionError(failure); }
    finally { if (!request.signal.aborted) { printingRequest.current = null; setPrinting(false); setPrintProgress(""); } }
  }
  function download() {
    try { downloadPdfBlob(file.blob, file.filename); setActionError(null); }
    catch { setActionError(new Error("The download could not start. Please try again.")); }
  }
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card p-3 sm:px-5">
      <div className="flex items-center gap-1">
        <button type="button" className={buttonClass} aria-label="Previous PDF page" disabled={!pdf || pageNumber <= 1 || printing} onClick={() => setPageNumber((page) => Math.max(1, page - 1))}><ChevronLeft className="size-4" /></button>
        <span aria-live="polite" className="min-w-21 text-center text-xs tabular-nums">{pdf ? `${pageNumber} / ${pdf.numPages}` : "— / —"}</span>
        <button type="button" className={buttonClass} aria-label="Next PDF page" disabled={!pdf || pageNumber >= pdf.numPages || printing} onClick={() => setPageNumber((page) => Math.min(pdf.numPages, page + 1))}><ChevronRight className="size-4" /></button>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className={buttonClass} aria-label="Zoom out PDF" disabled={zoom <= .5 || printing} onClick={() => setZoom((value) => Math.max(.5, value - .25))}><ZoomOut className="size-4" /></button>
        <button type="button" className={buttonClass} aria-label="Fit PDF to width" disabled={printing} onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button type="button" className={buttonClass} aria-label="Zoom in PDF" disabled={zoom >= 2 || printing} onClick={() => setZoom((value) => Math.min(2, value + .25))}><ZoomIn className="size-4" /></button>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={print} disabled={!pdf || Boolean(error) || printing} className={buttonClass}>{printing ? <LoaderCircle className="size-4 animate-spin" /> : <Printer className="size-4" />}Print</button>
        <button type="button" onClick={download} className={`${buttonClass} border-primary bg-primary text-primary-foreground hover:bg-primary/90`}><Download className="size-4" />Download</button>
      </div>
    </div>
    {printing && <p role="status" className="shrink-0 border-b border-border px-4 py-2 text-xs text-foreground-soft">{printProgress || "Preparing print…"}</p>}
    {actionError && <p role="alert" className="shrink-0 px-4 py-2 text-xs text-primary-emphasis">{actionError.message}</p>}
    <div ref={area} className="min-h-0 flex-1 overflow-auto overscroll-contain bg-muted/40 p-4">
      {error ? <ErrorUI error={error} reset={() => { setError(null); setPdf(null); setPageNumber(1); setRetry((value) => value + 1); }} compact logError={false} /> :
        <Document key={retry} file={file.url} options={options} suspense={false} loading={busy} externalLinkTarget="_blank" externalLinkRel="noopener noreferrer nofollow"
          onLoadSuccess={setPdf} onLoadError={setError} onSourceError={setError}
          onPassword={() => setError(new Error("This PDF is password-protected. Download it to open it in your PDF reader."))}
          className="mx-auto w-fit min-w-0 shadow-md">
          <Page pageNumber={pageNumber} width={width * zoom} devicePixelRatio={Math.min(globalThis.devicePixelRatio || 1, 2)} loading={busy} onLoadError={setError} onRenderError={setError} />
        </Document>}
    </div>
  </div>;
}
