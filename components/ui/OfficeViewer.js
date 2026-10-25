"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { ChevronLeft, ChevronRight, Download, LoaderCircle, Printer, ZoomIn, ZoomOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import ErrorUI from "./ErrorUI";
import { downloadPdfBlob } from "./downloadPdf";
import { parseOfficeFile } from "./officeWorkerClient.mjs";
import { createOfficeRoot, renderSheet, safeDocxElement, sanitizeOfficeContent, OFFICE_CSP } from "../../lib/office-preview-dom.mjs";

const buttonClass = "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";
const frameHtml = '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + OFFICE_CSP.replaceAll('"', "&quot;") + '"></head><body></body></html>';
const delayLimit = (task, ms, message) => {
  let timer;
  return Promise.race([task, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); })]).finally(() => clearTimeout(timer));
};

export default function OfficeViewer({ file }) {
  const [frameDoc, setFrameDoc] = useState(null);
  const [sheet, setSheet] = useState(0), [sheetData, setSheetData] = useState(null);
  const [page, setPage] = useState(1), [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(.75);
  const [loading, setLoading] = useState(true), [error, setError] = useState(null);
  const [retry, setRetry] = useState(0), [printing, setPrinting] = useState(false), [actionError, setActionError] = useState("");
  const [truncated, setTruncated] = useState(false);
  const contentRef = useRef(null), frame = useRef(null), printTimer = useRef(null);
  const printAbort = useRef(null), printFrame = useRef(null);
  const print = useReactToPrint({
    contentRef, documentTitle: file.filename, ignoreGlobalStyles: true,
    printIframeProps: { sandbox: "allow-same-origin allow-modals", referrerPolicy: "no-referrer" },
    pageStyle: file.kind === "spreadsheet" ? "@page{size:A4 landscape;margin:12mm}body{zoom:1!important}" : "@page{margin:0}body{zoom:1!important}",
    print: async target => {
      printFrame.current = target;
      await delayLimit(Promise.all([
        target.contentDocument?.fonts?.ready,
        ...Array.from(target.contentDocument?.images || []).map(image => image.decode?.().catch(() => {})),
      ]), 10_000, "Preparing print resources timed out.");
      printAbort.current?.signal.throwIfAborted();
      if (!printAbort.current || !target.isConnected || !target.contentWindow?.print) throw new Error("The print preview was closed.");
      target.contentWindow.focus(); target.contentWindow.print();
    },
    onBeforePrint: async () => {
      if (!contentRef.current || error || loading || truncated) throw new Error("Wait for the complete document preview before printing.");
      printAbort.current = new AbortController();
      setPrinting(true); setActionError("");
      clearTimeout(printTimer.current);
      printTimer.current = setTimeout(() => { setPrinting(false); setActionError("If the print dialog did not open, try again or download the original file."); }, 45_000);
      await delayLimit(Promise.all([
        frameDoc?.fonts?.ready,
        ...Array.from(contentRef.current.querySelectorAll("img")).map(image => image.decode?.().catch(() => {})),
      ]), 10_000, "Preparing the print timed out. Try again.");
    },
    onAfterPrint: () => { clearTimeout(printTimer.current); printAbort.current = null; printFrame.current = null; setPrinting(false); },
    onPrintError: () => { clearTimeout(printTimer.current); printAbort.current?.abort(); printAbort.current = null; printFrame.current?.remove(); printFrame.current = null; setPrinting(false); setActionError("Printing could not start. Try again or download the original file."); },
  });
  useEffect(() => () => { clearTimeout(printTimer.current); printAbort.current?.abort(); printFrame.current?.remove(); }, []);
  useEffect(() => {
    if (!frameDoc) return;
    const abort = new AbortController();
    let imageUrl;
    const root = createOfficeRoot(frameDoc);
    contentRef.current = null;
    setLoading(true); setError(null); setPages(0); setPage(1); setSheetData(null); setTruncated(false);
    (async () => {
      if (file.kind === "docx") {
        await parseOfficeFile(file, 0, abort.signal);
        const { renderAsync } = await import("docx-preview");
        const body = frameDoc.createElement("div"), styles = frameDoc.createElement("div");
        await delayLimit(renderAsync(await file.blob.arrayBuffer(), body, styles, {
          className: "docx", inWrapper: true, breakPages: true, useBase64URL: true,
          renderAltChunks: false, renderComments: false, experimental: false,
          h: value => safeDocxElement(frameDoc, value),
        }), 30_000, "Rendering the Word document timed out. Download the original to open it.");
        abort.signal.throwIfAborted();
        root.append(styles, body);
        sanitizeOfficeContent(root);
        const count = root.querySelectorAll("section.docx").length;
        if (!count) throw new Error("No document pages could be displayed.");
        if (count > 150) throw new Error("This document has too many pages for browser preview.");
        setPages(count);
      } else if (file.kind === "spreadsheet") {
        const parsed = await parseOfficeFile(file, sheet, abort.signal);
        abort.signal.throwIfAborted();
        renderSheet(frameDoc, root, parsed); setSheetData(parsed); setTruncated(parsed.truncated);
      } else if (file.kind === "text") {
        const text = await file.blob.text();
        abort.signal.throwIfAborted();
        if (text.includes("\u0000")) throw new Error("This file does not contain readable plain text.");
        const pre = frameDoc.createElement("pre"); pre.className = "office-text"; pre.textContent = text.slice(0, 500000); root.appendChild(pre);
        setTruncated(text.length > 500000);
      } else if (file.kind === "image") {
        imageUrl = URL.createObjectURL(file.blob);
        const image = frameDoc.createElement("img"); image.className = "office-image"; image.alt = file.filename; image.src = imageUrl; root.appendChild(image);
        await delayLimit(image.decode(), 10_000, "This image could not be displayed.");
      } else throw new Error("Preview is unavailable for this file type. Download the original to open it in its application.");
      abort.signal.throwIfAborted();
      contentRef.current = root;
      setLoading(false);
    })().catch(failure => {
      if (abort.signal.aborted) return;
      contentRef.current = null; root.replaceChildren();
      setError(failure); setLoading(false);
    });
    return () => { abort.abort(); contentRef.current = null; if (imageUrl) URL.revokeObjectURL(imageUrl); root.remove(); };
  }, [file, frameDoc, sheet, retry]);

  useEffect(() => { if (frameDoc) frameDoc.body.style.zoom = String(zoom); }, [frameDoc, zoom]);
  function goToPage(number) {
    const next = Math.min(Math.max(1, number), pages); setPage(next);
    frameDoc.querySelectorAll("section.docx")[next - 1]?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  function fitWidth() {
    const width = contentRef.current?.scrollWidth;
    if (width && frame.current) setZoom(Math.max(.25, Math.min(2, (frame.current.clientWidth - 32) / width)));
  }
  function download() {
    try { downloadPdfBlob(file.blob, file.filename); setActionError(""); }
    catch { setActionError("The original file could not be downloaded. Please try again."); }
  }
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card p-3 sm:px-5">
      {file.kind === "docx" && <div className="flex items-center gap-1">
        <button type="button" className={buttonClass} aria-label="Previous document page" disabled={loading || page <= 1 || printing} onClick={() => goToPage(page - 1)}><ChevronLeft className="size-4" /></button>
        <span aria-live="polite" className="min-w-21 text-center text-xs tabular-nums">{pages ? page + " / " + pages : "- / -"}</span>
        <button type="button" className={buttonClass} aria-label="Next document page" disabled={loading || page >= pages || printing} onClick={() => goToPage(page + 1)}><ChevronRight className="size-4" /></button>
      </div>}
      {sheetData && <Select value={String(sheetData.index)} onValueChange={value => setSheet(Number(value))} disabled={printing || loading}>
        <SelectTrigger aria-label="Worksheet" className="h-9 w-full min-w-0 bg-card text-xs sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent>{sheetData.names.map((name, index) => <SelectItem key={index} value={String(index)}>{name}</SelectItem>)}</SelectContent>
      </Select>}
      <div className="flex items-center gap-1">
        <button type="button" className={buttonClass} aria-label="Zoom out document" disabled={zoom <= .25 || printing} onClick={() => setZoom(value => Math.max(.25, value - .25))}><ZoomOut className="size-4" /></button>
        <button type="button" className={buttonClass} aria-label="Fit document to width" disabled={printing || loading} onClick={fitWidth}>{Math.round(zoom * 100)}%</button>
        <button type="button" className={buttonClass} aria-label="Zoom in document" disabled={zoom >= 2 || printing} onClick={() => setZoom(value => Math.min(2, value + .25))}><ZoomIn className="size-4" /></button>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => print()} disabled={loading || Boolean(error) || truncated || printing} className={buttonClass} title={file.kind === "spreadsheet" ? "Print the selected worksheet" : "Print the complete document"}>{printing ? <LoaderCircle className="size-4 animate-spin" /> : <Printer className="size-4" />}Print{file.kind === "spreadsheet" ? " sheet" : ""}</button>
        <button type="button" onClick={download} className={buttonClass + " border-primary bg-primary text-primary-foreground hover:bg-primary/90"}><Download className="size-4" />Download original file</button>
      </div>
    </div>
    <p className="shrink-0 border-b border-border px-4 py-2 text-xs text-muted-foreground">{file.kind === "spreadsheet" ? "Preview shows saved cell values; charts and complex formatting may differ. Select a sheet to preview and print it." : "Browser formatting may differ from the original file."}</p>
    {truncated && <p role="status" className="shrink-0 px-4 py-2 text-xs text-primary-emphasis">Preview limited to {file.kind === "spreadsheet" ? "1,000 rows and 100 columns" : "500,000 characters"}. Download the original for the full content. Printing is unavailable for partial previews.</p>}
    {actionError && <p role="alert" className="shrink-0 px-4 py-2 text-xs text-primary-emphasis">{actionError}</p>}
    {printing && <p role="status" className="shrink-0 px-4 py-2 text-xs text-muted-foreground">Preparing print...</p>}
    <div className="relative min-h-0 flex-1 bg-muted/40">
      {loading && <div role="status" className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-card text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />Preparing document preview...</div>}
      {error && <div className="absolute inset-0 z-10 overflow-auto bg-card p-4"><ErrorUI error={error} reset={() => setRetry(value => value + 1)} compact logError={false} /></div>}
      <iframe ref={frame} title={file.filename + " document content"} sandbox="allow-same-origin" referrerPolicy="no-referrer" srcDoc={frameHtml} onLoad={event => setFrameDoc(event.currentTarget.contentDocument)} className="h-full w-full border-0" />
    </div>
  </div>;
}
