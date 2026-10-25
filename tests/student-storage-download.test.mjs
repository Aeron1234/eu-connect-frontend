import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { createPdfPreviewController } from "../components/ui/pdfPreviewController.mjs";
import { createDocumentPreviewController } from "../components/ui/documentPreviewController.mjs";
import * as documentHelpers from "../lib/document-preview.mjs";
import { createToastAndAction } from "../lib/toast-and-action.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const pdf = { id: 7, file_type: "application/pdf", file_name: "Certificate" };

function load(file, mocks, globals = {}) {
  const url = new URL(`../components/internship-docs-ui/${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, {
    module: compiledModule, exports: compiledModule.exports, FormData, Headers, Response,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); }, ...globals,
  }, { filename: url.pathname });
  return compiledModule.exports.default;
}

function harness({ userRole = "student", internshipId = "current-record", actionResult,
  fetchResponse, fetchError, downloadWait, useDefault = false, isDownloading = false } = {}) {
  const tasks = [], actions = [], requests = [], previews = [], officePreviews = [], tabs = [], events = [], approved = [], changes = [];
  const getFile = async (payload) => {
    actions.push(payload);
    return actionResult || { success: true, url: "https://storage.example.test/signed-file", fileName: "My Certificate", message: "Old opening message" };
  };
  const office = createDocumentPreviewController();
  const controller = createPdfPreviewController({ createUrl: () => "blob:storage-preview", revokeUrl() {} });
  controller.subscribe(() => { const state = controller.getSnapshot(); events.push([state.status, state.status === "ready" ? "PDF preview ready." : state.error?.message || "Preparing PDF preview..."]); });
  const fetchFile = async (...args) => { requests.push(args); if (fetchError) throw fetchError; if (downloadWait) await downloadWait; return fetchResponse || new Response("%PDF-test"); };
  const hook = load("useDocumentActions.js", {
    "@/lib/document-preview.mjs": { ...documentHelpers, authorizedDocumentResponse: (...args) => documentHelpers.authorizedDocumentResponse(...args, fetchFile) },
    react: { useTransition: () => [isDownloading, (callback) => tasks.push(callback())] },
    "@/lib/helpers": { toastAndAction: createToastAndAction({
      loading: (message) => { events.push(["loading", message]); return 1; },
      success: (message) => events.push(["success", message]), error: (message) => events.push(["error", message]),
    }) },
    "@/components/ui/PdfPreviewProvider": { usePdfPreview: () => ({ previewPdf: async request => {
      const result = await controller.open(request);
      if (result) { const file = controller.getSnapshot().document; previews.push([file.blob, file.filename]); }
      return result;
    }, previewDocument: async request => {
      const result = await office.open(request);
      if (result) officePreviews.push(office.getSnapshot().document);
      return result;
    } }) },
    "@/lib/server-actions/internship-docs-actions": {
      downloadInternshipRecordDocuments: getFile,
      approveInternshipDocument: async (payload) => { approved.push(payload); return { success: true }; },
    },
  }, {
    window: { open: (...args) => tabs.push(args) },
    fetch: fetchFile,
  });
  const form = hook({ internshipId, userRole, downloadAction: useDefault ? null : getFile, onChanged: (value) => changes.push(value) });
  return { form, hook, getFile, actions, requests, previews, officePreviews, tabs, events, approved, changes, async settle() { await Promise.all(tasks.splice(0)); } };
}

test("current and past student PDFs open a preview using the authorized file URL", async () => {
  for (const internshipId of ["current-record", "past-record"]) {
    const h = harness({ internshipId }); h.form.handleDownload(pdf.id, pdf); await h.settle();
    assert.equal(h.actions[0].fileId, pdf.id); assert.equal(h.actions[0].internshipId, internshipId);
    assert.equal(h.requests.length, 1); assert.equal(h.requests[0][0], "https://storage.example.test/signed-file");
    assert.equal(h.requests[0][1].credentials, "omit"); assert.equal(h.requests[0][1].cache, "no-store");
    assert.equal(h.previews.length, 1); assert.equal(h.previews[0][1], "My Certificate.pdf");
    assert.equal(h.tabs.length, 0); assert.deepEqual(h.events.map(([type]) => type), ["loading", "ready"]);
    assert.equal(h.events[1][1], "PDF preview ready.");
  }
});

test("PDF detection accepts MIME types and filename extensions, with a named PDF fallback", async () => {
  for (const file of [pdf, { ...pdf, file_type: "APPLICATION/PDF; charset=binary" }, { ...pdf, file_type: "", file_name: "COC.PDF" }]) {
    const h = harness({ actionResult: { success: true, url: "https://storage.example.test/file" } });
    h.form.handleDownload(file.id, file); await h.settle();
    assert.equal(h.previews[0][1], file.file_name === "COC.PDF" ? "COC.PDF" : "Certificate.pdf");
    assert.equal(h.tabs.length, 0);
  }
});

test("internship-record PDF previews use the authorized record ID for every document viewer", async () => {
  for (const userRole of ["admin", "department_head", ""]) {
    const h = harness({ userRole, useDefault: true, internshipId: "viewed-record" });
    h.form.handleDownload(pdf.id, pdf); await h.settle();
    assert.equal(h.actions[0].fileId, pdf.id); assert.equal(h.actions[0].internshipId, "viewed-record");
    assert.equal(h.requests.length, 1); assert.equal(h.previews.length, 1); assert.equal(h.tabs.length, 0);
  }
});

test("non-PDF documents use the shared preview and retain scoped file authorization for all viewers", async () => {
  const file = { ...pdf, file_type: "text/plain" };
  for (const userRole of ["admin", "department_head", "", "student"]) {
    const h = harness({ userRole, useDefault: true }); h.form.handleDownload(file.id, file); await h.settle();
    assert.equal(h.requests.length, 1); assert.equal(h.previews.length, 0); assert.equal(h.tabs.length, 0);
    assert.equal(h.officePreviews.length, 1); assert.equal(h.officePreviews[0].kind, "text");
    assert.equal(h.actions[0].fileId, file.id); assert.equal(h.actions[0].internshipId, "current-record");
  }
});

test("denied authorization never fetches a storage file or reports a successful download", async () => {
  const h = harness({ actionResult: { success: false, error: "You don't have access to this file." } });
  h.form.handleDownload(pdf.id, pdf); await h.settle();
  assert.equal(h.requests.length, 0); assert.equal(h.previews.length, 0); assert.equal(h.tabs.length, 0);
  assert.deepEqual(h.events.map(([type]) => type), ["loading", "error"]);
});

test("expired URLs and network failures show a preview error without a false success or new tab", async () => {
  for (const options of [
    { fetchResponse: new Response("Expired", { status: 403 }) },
    { fetchResponse: new Response("Missing", { status: 404 }) },
    { fetchError: new Error("Network unavailable") },
    { actionResult: { success: true } },
  ]) {
    const h = harness(options); h.form.handleDownload(pdf.id, pdf); await h.settle();
    assert.equal(h.previews.length, 0); assert.equal(h.tabs.length, 0);
    assert.deepEqual(h.events.map(([type]) => type), ["loading", "error"]);
  }
});

test("the preview stays loading until the PDF response is ready", async () => {
  let finish, started;
  const downloading = new Promise((resolve) => { finish = resolve; });
  const h = harness({ downloadWait: downloading });
  h.form.handleDownload(pdf.id, pdf);
  for (let i = 0; i < 10; i += 1) { await Promise.resolve(); if (h.requests.length) { started = true; break; } }
  assert.equal(started, true); assert.deepEqual(h.events.map(([type]) => type), ["loading"]);
  finish(); await h.settle(); assert.deepEqual(h.events.map(([type]) => type), ["loading", "ready"]);
});

test("document approval still accepts the file and refreshes the original callbacks", async () => {
  let accepted = false;
  const h = harness(); h.form.handleApprove(pdf.id, () => { accepted = true; }); await h.settle();
  assert.equal(h.approved[0].get("fileId"), String(pdf.id)); assert.equal(accepted, true);
  assert.equal(h.changes[0].type, "approved"); assert.equal(h.changes[0].fileId, pdf.id);
  assert.equal(h.requests.length, 0); assert.equal(h.previews.length, 0);
});

test("the shared download button forwards file metadata and grid/list views retain their download action", () => {
  const calls = [];
  const Actions = load("DocumentActions.js", {
    react: { useState: () => [false, () => {}] },
    "@/components/ui/ConfirmDialog": () => null, "./StorageDeleteFile": () => null,
    "./documentPermissions": { canActuallyApprove: () => false, canActuallyDelete: () => false, isStudentDocumentOwner: () => true },
  });
  const tree = Actions({ item: pdf, handleDownload: (...args) => calls.push(args) });
  const button = tree.props.children.find((element) => element?.props?.["aria-label"] === "Preview PDF");
  button.props.onClick(); assert.equal(calls[0][0], pdf.id); assert.equal(calls[0][1], pdf);

  for (const view of ["grid", "list"]) {
    let options;
    const downloadAction = () => {};
    const Files = load("SearchedStudentFiles.js", {
      "./DocumentGridCard": () => null, "./DocumentListRow": () => null,
      "./useDocumentActions": (value) => { options = value; return {}; },
    });
    Files({ filtered: [pdf], userRole: "student", view, internshipId: "record-1", downloadAction });
    assert.equal(options.downloadAction, downloadAction); assert.equal(options.internshipId, "record-1");
  }
});

function profileHarness(options) {
  const h = harness(options);
  const hook = load("useEmployerCertificateUploads.js", {
    react: { useState: (initial) => [initial, () => {}], useCallback: (fn) => fn, useTransition: () => [false, () => {}] },
    "react-dropzone": { useDropzone: () => ({}) }, "@/lib/helpers": {},
    "@/lib/server-actions/internship-docs-actions": { downloadSearchedStudentFiles: h.getFile },
    "./useDocumentActions": h.hook,
  });
  return { ...h, profile: hook({ searchedUserId: "viewed-student", uploadedFiles: [pdf] }) };
}

test("profile certificate PDFs preview through the shared handler with the viewed student ID", async () => {
  for (const isDownloading of [false, true]) {
    const h = profileHarness({ isDownloading });
    assert.equal(h.profile.isUploading, isDownloading);
    h.profile.handleDownload(pdf.id, pdf); await h.settle();
    assert.equal(h.actions[0].searchedUserId, "viewed-student"); assert.equal(h.actions[0].fileId, pdf.id);
    assert.equal(h.actions[0].internshipId, undefined);
    assert.equal(h.previews.length, 1); assert.equal(h.tabs.length, 0);
    assert.deepEqual(h.events.map(([type]) => type), ["loading", "ready"]);
  }
});

test("profile certificate authorization and storage failures never open a tab or claim success", async () => {
  for (const options of [
    { actionResult: { success: false, error: "Forbidden" } },
    { fetchResponse: new Response("Expired", { status: 403 }) },
    { fetchError: new Error("Network unavailable") },
  ]) {
    const h = profileHarness(options); h.profile.handleDownload(pdf.id, pdf); await h.settle();
    assert.equal(h.previews.length, 0); assert.equal(h.tabs.length, 0);
    assert.deepEqual(h.events.map(([type]) => type), ["loading", "error"]);
  }
});

test("the profile certificate list forwards PDF metadata to its download handler", () => {
  const calls = [];
  const List = load("EmployerCertificateFileList.js", { "./EmployerCertificateStatusBadge": () => null });
  const file = { ...pdf, created_at: "2026-10-20" };
  const tree = List({ files: [file], handleDownload: (...args) => calls.push(args) });
  function findDownload(element) {
    if (Array.isArray(element)) return element.map(findDownload).find(Boolean);
    if (!element?.props) return null;
    if (element.props["aria-label"] === "Preview PDF") return element;
    return findDownload(element.props.children);
  }
  findDownload(tree).props.onClick();
  assert.equal(calls[0][0], file.id); assert.equal(calls[0][1], file);
});
