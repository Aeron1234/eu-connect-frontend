import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { renderAsync } from "docx-preview";
import { createDocumentPreviewController } from "../components/ui/documentPreviewController.mjs";
import { documentKind, documentFilename, authorizedDocumentResponse, readDocumentResponse, validateOfficeArchive, MAX_PREVIEW_BYTES } from "../lib/document-preview.mjs";
import { parseSpreadsheet } from "../lib/office-preview-data.mjs";
import { createOfficeRoot, renderSheet, sanitizeOfficeContent, safeDocxElement } from "../lib/office-preview-dom.mjs";

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const textResponse = () => new Response("Original text", { headers: { "Content-Type": "text/plain", "Content-Disposition": "attachment; filename*=UTF-8''sample.txt" } });

test("Office detection and filenames cover DOCX, legacy DOC, XLS/XLSX, CSV and plain text", () => {
  for (const [mime, kind, extension] of [
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document","docx","docx"],
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","spreadsheet","xlsx"],
    ["application/vnd.ms-excel","spreadsheet","xls"],["text/csv","spreadsheet","csv"],
    ["text/plain","text","txt"],["application/msword","unsupported","doc"],
  ]) {
    assert.equal(documentKind({ mimeType: mime }), kind);
    assert.equal(documentFilename("My file", mime), "My file." + extension);
  }
  assert.equal(documentKind({ filename: "REPORT.DOCX" }), "docx");
  assert.equal(documentFilename("../test:report.xlsx"), ".._test_report.xlsx");
});

test("document preview opens immediately, reuses original bytes, retries, and cancels stale loads", async () => {
  const controller = createDocumentPreviewController();
  let count = 0; const wait = deferred();
  const old = controller.open({ filename: "old.txt", load: () => wait.promise });
  assert.equal(controller.getSnapshot().status, "loading");
  const current = controller.open({ filename: "new.txt", load: async () => textResponse() });
  assert.equal(await old, false); assert.equal(await current, true);
  const doc = controller.getSnapshot().document;
  assert.equal(doc.filename, "sample.txt"); assert.equal(await doc.blob.text(), "Original text"); assert.equal(doc.kind, "text");
  wait.resolve(textResponse()); await Promise.resolve();
  assert.equal(controller.getSnapshot().document, doc);
  assert.equal(await controller.open({ filename: "retry.txt", load: async () => ++count === 1 ? Response.json({ error: "Denied" }, { status: 403 }) : textResponse() }), false);
  assert.equal(controller.getSnapshot().error.status, 403);
  assert.equal(await controller.retry(), true);
  const pending = controller.open({ load: () => new Promise(() => {}) });
  controller.close(); assert.equal(await pending, false); assert.equal(controller.getSnapshot().document, null);
});

test("stalled Office loads stop, and parser failures still allow the original download", async () => {
  const controller = createDocumentPreviewController({ timeoutMs: 10 });
  const downloadOriginal = async () => {};
  assert.equal(await controller.open({ filename: "file.docx", load: () => new Promise(() => {}), downloadOriginal }), false);
  assert.match(controller.getSnapshot().error.message, /timed out/);
  assert.equal(controller.getSnapshot().downloadOriginal, downloadOriginal);
  controller.close();
});

test("authorization is checked before storage reads and private credentials are never sent to storage", async () => {
  const payload = { internshipId: "owned-internship", fileId: "file" };
  const signal = new AbortController().signal; let calls = 0;
  const fetchFile = async (url, options) => { calls++; assert.equal(options.credentials, "omit"); assert.equal(options.cache, "no-store"); assert.equal(options.signal, signal); return new Response("bytes", { headers: { "Content-Type": "application/octet-stream" } }); };
  await assert.rejects(authorizedDocumentResponse(async () => ({ success: false, error: "Denied" }), payload, {}, signal, fetchFile), /Denied/);
  assert.equal(calls, 0);
  const response = await authorizedDocumentResponse(async value => { assert.equal(value, payload); return { success: true, url: "https://storage.example.test/private", fileName: "Original" }; }, payload, { mimeType: "text/plain" }, signal, fetchFile);
  assert.equal(calls, 1); assert.match(response.headers.get("Content-Disposition"), /Original.txt/);
  assert.equal(await response.text(), "bytes");
});

test("Office reads reject HTML errors, empty files, and oversized bodies while enforcing streamed byte limits", async () => {
  const signal = new AbortController().signal;
  await assert.rejects(readDocumentResponse(new Response("<script>alert(1)</script>", { headers: { "Content-Type": "text/html" } }), {}, signal), /did not return a document/);
  await assert.rejects(readDocumentResponse(new Response(""), {}, signal), /empty/);
  await assert.rejects(readDocumentResponse(new Response("test", { headers: { "Content-Length": String(MAX_PREVIEW_BYTES + 1) } }), {}, signal), /too large/);
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_PREVIEW_BYTES)); controller.enqueue(new Uint8Array(1)); controller.close(); } });
  await assert.rejects(readDocumentResponse(new Response(stream), {}, signal), /too large/);
});

test("SheetJS previews saved values from XLS/XLSX/CSV with sheet selection and escaped cell output", () => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Name", "Value"],["<img src=x onerror=alert(1)>", 42]]), "First");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Second", "Sheet"]]), "Next");
  for (const bookType of ["xlsx", "xls"]) {
    const buffer = XLSX.write(workbook, { type: "array", bookType });
    const first = parseSpreadsheet(buffer, 0), second = parseSpreadsheet(buffer, 1);
    assert.deepEqual(first.names, ["First","Next"]); assert.equal(first.rows[1].cells[1], "42");
    assert.equal(second.index, 1); assert.equal(second.rows[0].cells[0], "Second");
    const dom = new JSDOM("<body></body>"), root = createOfficeRoot(dom.window.document);
    renderSheet(dom.window.document, root, first);
    assert(root.textContent.includes("<img src=x onerror=alert(1)>"));
    assert.equal(root.querySelector("img"), null); assert.equal(root.querySelector("script"), null);
    dom.window.close();
  }
  const csv = new TextEncoder().encode("Name,Value\nExample,9").buffer;
  assert.equal(parseSpreadsheet(csv).rows[1].cells[1], "9");
});

test("oversized worksheets are explicitly marked partial and formulas or hyperlinks are never rendered as HTML", () => {
  const sheet = XLSX.utils.aoa_to_sheet(Array.from({ length: 1002 }, (_, index) => [index, "data"]));
  sheet.A1 = { t: "s", v: "Safe", f: "HYPERLINK(\"https://example.test\",\"Go\")", l: { Target: "https://example.test" }, h: "<script>bad()</script>" };
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, sheet, "Long");
  const parsed = parseSpreadsheet(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
  assert.equal(parsed.truncated, true); assert(parsed.rows.length <= 1000); assert.equal(parsed.rows[0].cells[0], "Safe");
});

async function wordFixture() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file("word/document.xml", '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Page one</w:t></w:r></w:p><w:p><w:r><w:br w:type="page"/></w:r></w:p><w:p><w:r><w:t>Page two</w:t></w:r></w:p><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:bottom="1440" w:left="1440" w:right="1440"/></w:sectPr></w:body></w:document>');
  zip.file("word/_rels/document.xml.rels", '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rImage" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>');
  zip.file("word/media/logo.png", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=", { base64: true });
  zip.file("[Content_Types].xml", (await zip.file("[Content_Types].xml").async("string")).replace("</Types>", '<Default Extension="png" ContentType="image/png"/></Types>'));
  const imageXml = '<w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="914400" cy="914400"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rImage"/></pic:blipFill><pic:spPr><a:xfrm><a:ext cx="914400" cy="914400"/></a:xfrm></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  zip.file("word/document.xml", (await zip.file("word/document.xml").async("string")).replace("</w:p>", imageXml + "</w:p>"));
  return zip.generateAsync({ type: "arraybuffer" });
}

test("real DOCX rendering retains all pages and Word styles in an isolated document ready for printing", async t => {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>");
  const globals = ["window","document","DOMParser","XMLSerializer","Node","FileReader","Blob"];
  const previous = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of globals) Object.defineProperty(globalThis, name, { value: dom.window[name], writable: true, configurable: true });
  t.after(() => { for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } dom.window.close(); });
  const buffer = await wordFixture(); validateOfficeArchive(buffer, "word/document.xml");
  const doc = dom.window.document, root = createOfficeRoot(doc), body = doc.createElement("div"), styles = doc.createElement("div");
  await renderAsync(buffer, body, styles, { inWrapper: true, useBase64URL: true, breakPages: true, renderAltChunks: false, h: value => safeDocxElement(doc, value) }).catch(error => { throw new Error(String(error) + " " + error.stack); });
  root.append(styles, body); sanitizeOfficeContent(root);
  assert(root.textContent.includes("Page one")); assert(root.textContent.includes("Page two"));
  assert.equal(root.querySelectorAll("section.docx").length, 2);
  assert(root.querySelectorAll("style").length >= 2);
  assert.match(root.querySelector("img").getAttribute("src"), /^data:image\/png;base64,/);
});

test("DOCX sanitization removes active content and remote resource rules before printing", () => {
  const dom = new JSDOM("<!doctype html><body></body>");
  const doc = dom.window.document, root = createOfficeRoot(doc);
  const body = doc.createElement("div");
  body.innerHTML = '<script>bad()</script><iframe src="https://example.test"></iframe><a href="javascript:alert(1)" onclick="bad()">Link</a><img src="https://example.test/track.png"><p style="background-image:url(https://example.test/track)">Text</p>';
  root.appendChild(body);
  const style = doc.createElement("style"); style.textContent = '@import "https://example.test/remote.css";p{background-image:url("https://example.test/track.png");color:red}';
  root.appendChild(style); sanitizeOfficeContent(root);
  assert.equal(root.querySelector("script,iframe"), null);
  assert.equal(root.querySelector("a").hasAttribute("href"), false);
  assert.equal(root.querySelector("a").hasAttribute("onclick"), false);
  assert.equal(root.querySelector("img").hasAttribute("src"), false);
  assert(!root.innerHTML.includes("https://example.test"));
  assert(root.textContent.includes("Text"));
  dom.window.close();
});

test("ZIP validation rejects wrong document types and oversized declared archive entries", async () => {
  const buffer = await wordFixture();
  assert.throws(() => validateOfficeArchive(buffer, "xl/workbook.xml"), /does not match/);
  const changed = buffer.slice(0), view = new DataView(changed);
  let central = 0;
  for (; central < changed.byteLength - 46; central++) if (view.getUint32(central, true) === 0x02014b50) break;
  view.setUint32(central + 24, 101 * 1024 * 1024, true);
  assert.throws(() => validateOfficeArchive(changed, "word/document.xml"), /too large/);
});
