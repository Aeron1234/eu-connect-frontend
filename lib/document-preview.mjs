import { pdfFilename, downloadPdfBlob } from "../components/ui/downloadPdf.js";

export const MAX_PREVIEW_BYTES = 25 * 1024 * 1024;
const types = {
  "application/pdf": ["pdf", "pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx", "docx"],
  "application/msword": ["unsupported", "doc"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["spreadsheet", "xlsx"],
  "application/vnd.ms-excel": ["spreadsheet", "xls"],
  "text/csv": ["spreadsheet", "csv"],
  "application/csv": ["spreadsheet", "csv"],
  "text/plain": ["text", "txt"],
  "image/jpeg": ["image", "jpg"], "image/png": ["image", "png"], "image/webp": ["image", "webp"],
};
const extensions = { pdf: "pdf", docx: "docx", xlsx: "spreadsheet", xls: "spreadsheet", csv: "spreadsheet", txt: "text", jpg: "image", jpeg: "image", png: "image", webp: "image" };

// Prefer known MIME metadata, then the filename extension. This selects a viewer;
// it does not establish file safety or replace parsing/authorization.
export function documentKind({ filename = "", mimeType = "", file_name, file_type } = {}) {
  const mime = String(file_type || mimeType).split(";")[0].trim().toLowerCase();
  return types[mime]?.[0] || extensions[String(file_name || filename).split(".").pop().toLowerCase()] || "unsupported";
}

export function documentFilename(filename = "document", mimeType = "") {
  const safe = String(filename).replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "_").trim() || "document";
  const extension = types[String(mimeType).split(";")[0].trim().toLowerCase()]?.[1];
  return extension && !/\.[a-z0-9]{2,5}$/i.test(safe) ? safe + "." + extension : safe;
}

export async function authorizedDocumentResponse(getFile, payload, metadata, signal, fetchFile = fetch) {
  signal?.throwIfAborted();
  // Obtain a fresh authorized signed URL before storage access. The storage fetch
  // omits app cookies; cancellation checkpoints discard late server-action results.
  const result = await getFile(payload);
  signal?.throwIfAborted();
  if (!result?.success || !result.url) throw Object.assign(new Error(result?.error || "Could not open the file."), { status: result?.status, code: result?.code });
  const response = await fetchFile(result.url, { credentials: "omit", cache: "no-store", signal });
  const headers = new Headers(response.headers);
  const type = metadata?.file_type || metadata?.mimeType || "";
  const name = documentFilename(result.fileName || metadata?.file_name || metadata?.filename, type);
  headers.set("Content-Disposition", "attachment; filename*=UTF-8''" + encodeURIComponent(name));
  // Storage may return a generic binary type. Preserve real error response types.
  if ((!headers.get("Content-Type") || headers.get("Content-Type").startsWith("application/octet-stream")) && type) headers.set("Content-Type", type);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Explicit fallback after a failed preview read: reauthorize and download original
// bytes without applying the browser preview's parsing or display limits.
export async function downloadAuthorizedOriginal(getFile, payload, metadata, signal) {
  const response = await authorizedDocumentResponse(getFile, payload, metadata, signal);
  if (!response.ok) throw new Error("The original file could not be downloaded. Please try again.");
  const blob = await response.blob(); signal.throwIfAborted();
  downloadPdfBlob(blob, pdfFilename(response, metadata.filename || "document"));
}

export async function readDocumentResponse(response, request, signal) {
  signal?.throwIfAborted();
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || "Could not load the file (" + response.status + ")."), { status: response.status });
  }
  if (Number(response.headers.get("Content-Length")) > MAX_PREVIEW_BYTES) {
    await response.body?.cancel();
    throw new Error("This file is too large for the browser preview (25 MB maximum).");
  }
  // For streamed responses, enforce the preview byte cap even without Content-Length.
  // Abort cancels the reader; original downloads follow a separate path.
  const reader = response.body?.getReader();
  const chunks = []; let bytes = 0;
  const onAbort = () => { void reader?.cancel().catch(() => {}); };
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    if (reader) {
      while (true) {
        signal?.throwIfAborted();
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_PREVIEW_BYTES) throw new Error("This file is too large for the browser preview (25 MB maximum).");
        chunks.push(value);
      }
    } else chunks.push(new Uint8Array(await response.arrayBuffer()));
  } catch (error) { await reader?.cancel().catch(() => {}); throw error; }
  finally { signal?.removeEventListener("abort", onAbort); reader?.releaseLock(); }
  signal?.throwIfAborted();
  const mimeType = response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() || request.mimeType || "";
  const filename = documentFilename(pdfFilename(response, request.filename || "document"), request.mimeType || mimeType);
  if (["text/html", "application/json"].includes(mimeType)) throw new Error("The server did not return a document. Please try again.");
  const blob = new Blob(chunks, { type: mimeType });
  if (!blob.size) throw new Error("This file is empty.");
  return { blob, filename, mimeType, kind: documentKind({ filename, mimeType: request.mimeType || mimeType }) };
}

// Inspect ZIP central-directory metadata before Office decompression. Reject encrypted,
// ZIP64-marked, oversized or complex archives and require the expected document entry.
// This preflight supplements the format parser; it is not full ZIP integrity validation.
export function validateOfficeArchive(buffer, requiredEntry) {
  const data = new Uint8Array(buffer), view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let end = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error("This is not a readable Office document.");
  const count = view.getUint16(end + 10, true), offset = view.getUint32(end + 16, true);
  if (count > 2000 || count === 0xffff || offset === 0xffffffff) throw new Error("This document is too complex for browser preview.");
  let position = offset, total = 0, found = !requiredEntry;
  for (let n = 0; n < count; n++) {
    if (position + 46 > end || view.getUint32(position, true) !== 0x02014b50) throw new Error("This Office document is damaged.");
    const flags = view.getUint16(position + 8, true), size = view.getUint32(position + 24, true);
    if (flags & 1) throw new Error("Password-protected files cannot be previewed. Download the original to open it.");
    total += size;
    if (size === 0xffffffff || total > 100 * 1024 * 1024) throw new Error("This document is too large to unpack for preview.");
    const nameSize = view.getUint16(position + 28, true), extra = view.getUint16(position + 30, true), comment = view.getUint16(position + 32, true);
    if (position + 46 + nameSize + extra + comment > end) throw new Error("This Office document is damaged.");
    const name = new TextDecoder().decode(data.subarray(position + 46, position + 46 + nameSize));
    if (name === requiredEntry) found = true;
    position += 46 + nameSize + extra + comment;
  }
  if (!found) throw new Error("This file does not match its Office document type.");
}
