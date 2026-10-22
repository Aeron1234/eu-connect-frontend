import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { createPdfPreviewController, readPreviewPdf } from "../components/ui/pdfPreviewController.mjs";
import { printPdfDocument } from "../components/ui/printPdfDocument.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const response = () => new Response("%PDF-demo", { headers: { "Content-Disposition": 'attachment; filename="sample.pdf"' } });
function fixture(options) {
  const created = [], revoked = [];
  const controller = createPdfPreviewController({ createUrl: blob => { created.push(blob); return `blob:pdf-${created.length}`; }, revokeUrl: url => revoked.push(url), ...options });
  return { controller, created, revoked };
}
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

test("preview opens loading, stores one PDF and filename, and releases it on close", async () => {
  const h = fixture(), pending = deferred(); let signal, reads = 0;
  const result = h.controller.open({ filename: "fallback.pdf", load: value => { signal = value; reads++; return pending.promise; } });
  assert.equal(h.controller.getSnapshot().status, "loading");
  await Promise.resolve(); assert.equal(reads, 1); pending.resolve(response()); assert.equal(await result, true);
  const state = h.controller.getSnapshot(); assert.equal(state.status, "ready"); assert.equal(state.document.filename, "sample.pdf");
  assert.equal(await state.document.blob.text(), "%PDF-demo"); assert.equal(state.document.url, "blob:pdf-1"); assert.equal(h.created.length, 1);
  h.controller.close(); assert(signal.aborted); assert.equal(h.controller.getSnapshot().open, false); assert.equal(h.controller.getSnapshot().document, null); assert.deepEqual(h.revoked, ["blob:pdf-1"]);
});

test("close or navigation cancels pending reads and late completions cannot reopen a private preview", async () => {
  for (const cleanup of ["close", "dispose"]) {
    const h = fixture(), late = deferred();
    const result = h.controller.open({ load: () => late.promise }); await Promise.resolve(); h.controller[cleanup]();
    assert.equal(await result, false); late.resolve(response()); await Promise.resolve();
    assert.equal(h.controller.getSnapshot().open, false); assert.equal(h.created.length, 0);
  }
});

test("a newer preview replaces an older request and releases the previous PDF URL", async () => {
  const h = fixture(); await h.controller.open({ load: async () => response() });
  const late = deferred(), old = h.controller.open({ load: () => late.promise });
  const latest = h.controller.open({ load: async () => new Response("%PDF-new") });
  assert.equal(await old, false); assert.equal(await latest, true); late.resolve(response());
  assert.equal(await h.controller.getSnapshot().document.blob.text(), "%PDF-new"); assert.deepEqual(h.revoked, ["blob:pdf-1"]); h.controller.close();
});

test("errors preserve server status/codes, retry succeeds, and malformed PDF responses never reach the viewer", async () => {
  const h = fixture(); let calls = 0;
  const request = { load: async () => ++calls === 1 ? Response.json({ error: "Busy", code: "PDF_BUSY" }, { status: 503 }) : response() };
  assert.equal(await h.controller.open(request), false); assert.equal(h.controller.getSnapshot().error.status, 503); assert.equal(h.controller.getSnapshot().error.code, "PDF_BUSY");
  assert.equal(await h.controller.retry(), true); assert.equal(calls, 2); h.controller.close();
  await assert.rejects(readPreviewPdf(new Response("<html>Login</html>"), "bad.pdf"), /not a valid PDF/);
  assert.equal((await readPreviewPdf(new Response("%PDF-demo", { headers: { "Content-Disposition": "attachment; filename*=UTF-8''%E6%96%87%E4%BB%B6.pdf" } }), "file.pdf")).filename, "文件.pdf");
});

test("a stalled request becomes a retryable timeout instead of leaving the modal loading forever", async () => {
  const h = fixture({ timeoutMs: 10 });
  assert.equal(await h.controller.open({ load: () => new Promise(() => {}) }), false);
  const state = h.controller.getSnapshot(); assert.equal(state.status, "error"); assert.equal(state.error.code, "PDF_TIMEOUT"); assert.equal(state.error.status, 504); h.controller.close();
});

function load(file, mocks) {
  const url = new URL(`../components/ui/${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, AbortController, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return mod.exports.default;
}
function nodes(tree) { return !tree?.props ? [] : [tree, ...React.Children.toArray(tree.props.children).flatMap(nodes)]; }

test("viewer supports page navigation, zoom, printing all pages and downloading the same blob without refetching", async () => {
  const state = [], refs = []; let cursor = 0, refCursor = 0;
  const downloads = [], printed = [], worker = {};
  const pdf = { numPages: 3 };
  const file = { filename: "sample.pdf", blob: new Blob(["%PDF-demo"]), url: "blob:test" };
  const Document = function Document() {}, Page = function Page() {};
  const View = load("PdfViewer.js", {
    react: { ...React, useEffect() {}, useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }]; }, useRef(initial) { return refs[refCursor++] ||= { current: initial }; } },
    "react-pdf": { Document, Page, pdfjs: { version: "test", GlobalWorkerOptions: worker } },
    "react-pdf/dist/Page/TextLayer.css": {}, "react-pdf/dist/Page/AnnotationLayer.css": {},
    "./downloadPdf": { downloadPdfBlob: (...args) => downloads.push(args) },
    "./printPdfDocument.mjs": { printPdfDocument: async (...args) => { printed.push(args); return () => {}; } },
    "./ErrorUI": () => null,
  });
  function render() { cursor = 0; refCursor = 0; return nodes(View({ file })); }
  const button = (list, label) => list.find(node => node.type === "button" && (node.props["aria-label"] === label || React.Children.toArray(node.props.children).includes(label)));
  let tree = render(); assert(button(tree, "Print").props.disabled);
  tree.find(node => node.type === Document).props.onLoadSuccess(pdf); tree = render();
  assert.equal(button(tree, "Previous PDF page").props.disabled, true);
  button(tree, "Next PDF page").props.onClick(); tree = render(); assert.equal(tree.find(node => node.type === Page).props.pageNumber, 2);
  assert.equal(tree.find(node => node.type === Page).props.width, 210);
  assert.equal(React.Children.toArray(button(tree, "Fit PDF to width").props.children).join(""), "75%");
  button(tree, "Zoom in PDF").props.onClick(); tree = render(); assert.equal(tree.find(node => node.type === Page).props.width, 280);
  button(tree, "Download").props.onClick(); assert.equal(downloads[0][0], file.blob); assert.equal(downloads[0][1], file.filename);
  await button(tree, "Print").props.onClick(); assert.equal(printed[0][0], pdf);
  assert.equal(worker.workerSrc, "/pdfjs/test/pdf.worker.min.mjs");
});

test("PDF.js worker/resources are local, version matched and prepared on install/build", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const pdfjs = JSON.parse(readFileSync(require.resolve("pdfjs-dist/package.json"), "utf8"));
  assert(pkg.dependencies["react-pdf"]);
  for (const event of ["postinstall", "predev", "prebuild"]) assert(pkg.scripts[event].includes("prepare-pdf-preview.mjs"));
  for (const asset of ["pdf.worker.min.mjs", "cmaps", "standard_fonts", "wasm", "LICENSE"]) assert(existsSync(new URL(`../public/pdfjs/${pdfjs.version}/${asset}`, import.meta.url)));
  const provider = readFileSync(new URL("../components/ui/PdfPreviewProvider.js", import.meta.url), "utf8");
  assert(provider.includes("key={pathname}"));
});

test("printing retains embedded fonts, includes every page at its paper size, and cleans up after printing", async () => {
  const original = globalThis.document;
  const embeddedFont = "pdfjs-loaded-Times-New-Roman";
  const sheets = [], rendered = [], progress = []; let afterprint, printed = false, removed = false;
  const canvas = ownerDocument => ({ width: 0, height: 0, getContext: () => ({ ownerDocument }), toDataURL: () => "data:image/png;base64,test" });
  // PDF.js loads embedded FontFaces into the viewer document's FontFaceSet.
  // A canvas owned by the isolated print frame cannot use those fonts.
  const printDoc = { fonts: new Set(), head: { appendChild() {} }, body: { appendChild(node) { sheets.push(node); } }, createElement(tag) {
    if (tag === "canvas") return canvas(printDoc);
    if (tag === "img") return { decode: async () => {} };
    return { style: {}, appendChild() {}, textContent: "" };
  } };
  const viewerDoc = { fonts: new Set([embeddedFont]), body: { appendChild() {} }, createElement(tag) {
    if (tag === "canvas") return canvas(viewerDoc);
    assert.equal(tag, "iframe");
    return { style: {}, title: "", setAttribute() {}, remove() { removed = true; }, contentDocument: printDoc, contentWindow: { addEventListener(name, callback) { if (name === "afterprint") afterprint = callback; }, focus() {}, print() { printed = true; } } };
  } };
  globalThis.document = viewerDoc;
  try {
    const pdf = { numPages: 2, async getPage(number) { return { getViewport: ({ scale }) => ({ width: (number === 1 ? 595 : 1008) * scale, height: (number === 1 ? 842 : 612) * scale }), render({ canvasContext, intent }) {
      assert.equal(intent, "print");
      assert(canvasContext.ownerDocument.fonts.has(embeddedFont), "Print canvas must have access to the PDF's embedded fonts");
      rendered.push(number); return { promise: Promise.resolve(), cancel() {} };
    } }; } };
    await printPdfDocument(pdf, { title: "sample.pdf", onProgress: page => progress.push(page) });
    assert.equal(printed, true); assert.deepEqual(rendered, [1, 2]); assert.deepEqual(progress, [1, 2]); assert.equal(sheets.length, 2);
    assert.equal(sheets[0].style.width, "595pt"); assert.equal(sheets[1].style.width, "1008pt");
    afterprint(); assert.equal(removed, true);
  } finally { globalThis.document = original; }
});
