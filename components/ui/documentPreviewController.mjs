import { readDocumentResponse } from "../../lib/document-preview.mjs";
const closed = Object.freeze({ open: false, status: "idle", document: null, error: null, filename: "" });

export function createDocumentPreviewController({ timeoutMs = 45_000 } = {}) {
  let state = closed, version = 0, abort, lastRequest, disposed = false;
  const listeners = new Set();
  const emit = next => { state = next; for (const listener of listeners) listener(); };
  function cancel() { version++; abort?.abort(); }
  async function open(request) {
    if (disposed) return false;
    cancel(); lastRequest = request;
    const current = version, controller = abort = new AbortController();
    emit({ open: true, status: "loading", document: null, error: null, filename: request.filename || "document", downloadOriginal: request.downloadOriginal });
    const timer = setTimeout(() => controller.abort(new Error("Preparing the document timed out. Please try again.")), timeoutMs);
    let aborted;
    try {
      const file = await Promise.race([
        Promise.resolve().then(async () => readDocumentResponse(await request.load(controller.signal), request, controller.signal)),
        new Promise((_, reject) => { aborted = () => reject(controller.signal.reason); controller.signal.addEventListener("abort", aborted, { once: true }); }),
      ]);
      if (controller.signal.aborted || current !== version || disposed) return false;
      emit({ open: true, status: "ready", document: file, error: null, filename: file.filename });
      return true;
    } catch (error) {
      if (current !== version || disposed) return false;
      emit({ open: true, status: "error", document: null, filename: request.filename || "document", downloadOriginal: request.downloadOriginal, error: error instanceof Error ? error : new Error("Could not open the file.") });
      return false;
    } finally { clearTimeout(timer); if (aborted) controller.signal.removeEventListener("abort", aborted); }
  }
  return {
    open, retry: () => lastRequest ? open(lastRequest) : Promise.resolve(false),
    close() { cancel(); lastRequest = null; emit(closed); },
    dispose() { disposed = true; cancel(); lastRequest = null; state = closed; listeners.clear(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => state, getServerSnapshot: () => closed,
  };
}
