import { pdfFilename } from "./downloadPdf.js";

export async function readPreviewPdf(response, fallbackFilename, signal) {
  signal?.throwIfAborted();
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || `Could not load the PDF (${response.status}).`), { status: response.status, code: data.code });
  }
  const blob = await response.blob();
  signal?.throwIfAborted();
  if (!(await blob.slice(0, 1024).text()).includes("%PDF-")) {
    throw new Error("The response was not a valid PDF. Please try again.");
  }
  return { blob: new Blob([blob], { type: "application/pdf" }), filename: pdfFilename(response, fallbackFilename) };
}

const closed = Object.freeze({ open: false, status: "idle", document: null, error: null, filename: "" });

export function createPdfPreviewController({ createUrl = (blob) => URL.createObjectURL(blob), revokeUrl = (url) => URL.revokeObjectURL(url), timeoutMs = 45_000 } = {}) {
  let state = closed, abortController, objectUrl, version = 0, disposed = false, lastRequest;
  const listeners = new Set();
  function emit(next) { state = next; for (const listener of listeners) listener(); }
  function cancel() {
    version++;
    abortController?.abort();
    if (objectUrl) { revokeUrl(objectUrl); objectUrl = null; }
  }
  async function open(request) {
    if (disposed) return false;
    cancel(); lastRequest = request;
    const current = version;
    const abort = abortController = new AbortController();
    emit({ open: true, status: "loading", document: null, error: null, filename: request.filename || "report.pdf" });
    const timeout = setTimeout(() => abort.abort(Object.assign(new Error("Preparing the PDF timed out. Please try again."), { status: 504, code: "PDF_TIMEOUT" })), timeoutMs);
    let onAbort;
    try {
      const file = await Promise.race([
        Promise.resolve().then(async () => readPreviewPdf(await request.load(abort.signal), request.filename || "report.pdf", abort.signal)),
        new Promise((_, reject) => { onAbort = () => reject(abort.signal.reason); abort.signal.addEventListener("abort", onAbort, { once: true }); }),
      ]);
      if (disposed || abort.signal.aborted || current !== version) return false;
      objectUrl = createUrl(file.blob);
      emit({ open: true, status: "ready", document: { ...file, url: objectUrl }, error: null, filename: file.filename });
      return true;
    } catch (error) {
      if (disposed || current !== version) return false;
      emit({ open: true, status: "error", document: null, error: error instanceof Error ? error : new Error("Could not prepare the PDF preview."), filename: request.filename || "report.pdf" });
      return false;
    } finally { clearTimeout(timeout); if (onAbort) abort.signal.removeEventListener("abort", onAbort); }
  }
  return {
    open,
    retry: () => lastRequest ? open(lastRequest) : Promise.resolve(false),
    close() { cancel(); lastRequest = null; emit(closed); },
    dispose() { disposed = true; cancel(); lastRequest = null; state = closed; listeners.clear(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => state,
    getServerSnapshot: () => closed,
  };
}
