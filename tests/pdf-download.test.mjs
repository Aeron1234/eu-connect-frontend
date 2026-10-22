import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { createPdfPreviewController } from "../components/ui/pdfPreviewController.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");

function load(file, mocks = {}, globals = {}) {
  const url = new URL(`../${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, {
    module: compiledModule, exports: compiledModule.exports, URL, URLSearchParams,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); }, ...globals,
  }, { filename: url.pathname });
  return compiledModule.exports;
}

function browser({ clickError = false } = {}) {
  const links = [], blobs = [], revoked = [], timers = [];
  const { downloadPdf } = load("components/ui/downloadPdf.js", {}, {
    document: {
      createElement(tag) {
        assert.equal(tag, "a");
        const link = { clicks: 0, removed: false,
          click() { link.clicks += 1; if (clickError) throw new Error("Download failed"); },
          remove() { link.removed = true; } };
        links.push(link); return link;
      },
      body: { appendChild(link) { link.attached = true; } },
    },
    URL: { createObjectURL(blob) { blobs.push(blob); return `blob:pdf-${blobs.length}`; }, revokeObjectURL(url) { revoked.push(url); } },
    // No window.open or location: exports must not navigate or create tabs.
    window: { setTimeout(callback, delay) { timers.push({ callback, delay }); } },
  });
  return { downloadPdf, links, blobs, revoked, timers };
}

test("PDF download clicks a named download link and releases the blob after the browser starts reading it", async () => {
  const b = browser();
  await b.downloadPdf(new Response("%PDF-demo", { headers: { "Content-Disposition": 'attachment; filename="annual-report.pdf"' } }));
  assert.equal(b.links.length, 1); assert.equal(b.links[0].download, "annual-report.pdf");
  assert.equal(b.links[0].href, "blob:pdf-1"); assert.equal(b.links[0].clicks, 1);
  assert.equal(b.links[0].attached, true); assert.equal(b.links[0].removed, true);
  assert.equal(b.revoked.length, 0); assert.equal(b.timers.length, 1); assert.ok(b.timers[0].delay >= 1000);
  assert.equal(await b.blobs[0].text(), "%PDF-demo");
  b.timers[0].callback(); assert.deepEqual(b.revoked, ["blob:pdf-1"]);
});

test("download names fall back when missing and replace filesystem separators", async () => {
  for (const [disposition, expected] of [
    [null, "summary-report.pdf"], ['attachment; filename="company/report:2026.pdf"', "company_report_2026.pdf"],
    ["attachment; filename=report.pdf", "report.pdf"],
  ]) {
    const b = browser();
    await b.downloadPdf(new Response("%PDF", { headers: disposition ? { "Content-Disposition": disposition } : {} }), "summary-report.pdf");
    assert.equal(b.links[0].download, expected);
  }
});

test("failed downloads remove their temporary link and release object URLs without swallowing the error", async () => {
  const b = browser({ clickError: true });
  await assert.rejects(b.downloadPdf(new Response("%PDF")), /Download failed/);
  assert.equal(b.links[0].removed, true); assert.deepEqual(b.revoked, ["blob:pdf-1"]); assert.equal(b.timers.length, 0);
  const unreadable = browser();
  await assert.rejects(unreadable.downloadPdf({ headers: new Headers(), blob: async () => { throw new Error("Read failed"); } }), /Read failed/);
  assert.equal(unreadable.blobs.length, 0); assert.equal(unreadable.links.length, 0);
});

const internshipId = "0cc53aab-0f22-42f9-976b-fdf50144a8ef";
const reports = [
  { route: "annex-c", params: "reportId=report-1", generator: "generateAnnexCPdf", name: "annex-c-report-1.pdf" },
  { route: "annex-d", params: "companyKey=company-1&academicYear=2026-2027", generator: "generateAnnexDPdf", name: "annex-d-2026-2027-company-1.pdf" },
  { route: "student-evaluation", params: "evaluationId=evaluation-1", generator: "generateStudentEvaluationPdf", name: "student-evaluation-evaluation-1.pdf" },
  { route: "summary-report", params: `internshipId=${internshipId}`, generator: "generateSummaryReportPdf", name: `summary-report-${internshipId}.pdf` },
  { route: "weekly-narratives", params: `internshipId=${internshipId}`, generator: "generateWeeklyNarrativesPdf", name: `weekly-narratives-${internshipId}.pdf` },
];

test("all five PDF endpoints return downloadable attachments with their existing names and private caching", async () => {
  for (const report of reports) {
    let renders = 0;
    const { GET } = load(`app/api/reports/${report.route}/route.js`, {
      "@/app/_services/pdfReports": { [report.generator]: async () => { renders += 1; return Buffer.from("%PDF-demo"); } },
      "@/lib/server-actions/auth": { getAccessToken: async () => "test-token" },
      "next/server": { NextResponse: Response }, "@/app/_services/pdfResponse.mjs": {},
    });
    const response = await GET(new Request(`http://example.test/api/reports/${report.route}?${report.params}`));
    assert.equal(response.status, 200); assert.equal(response.headers.get("Content-Type"), "application/pdf");
    assert.equal(response.headers.get("Content-Disposition"), `attachment; filename="${report.name}"`);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store"); assert.equal(renders, 1);
    const b = browser(); await b.downloadPdf(response); assert.equal(b.links[0].download, report.name);
  }
});

test("PDF endpoints still reject missing parameters and authentication before generating a file", async () => {
  for (const report of reports) {
    let renders = 0;
    const { GET } = load(`app/api/reports/${report.route}/route.js`, {
      "@/app/_services/pdfReports": { [report.generator]: async () => { renders += 1; } },
      "@/lib/server-actions/auth": { getAccessToken: async () => null },
      "next/server": { NextResponse: Response }, "@/app/_services/pdfResponse.mjs": {},
    });
    assert.equal((await GET(new Request(`http://example.test/api/reports/${report.route}`))).status, 400);
    assert.equal((await GET(new Request(`http://example.test/api/reports/${report.route}?${report.params}`))).status, 401);
    assert.equal(renders, 0);
  }
});

function exporter(kind, response) {
  const states = [], previews = [], requests = [], refs = [];
  let index = 0, refIndex = 0;
  const controller = createPdfPreviewController({ createUrl: () => "blob:preview", revokeUrl() {} });
  const Hook = load("components/ui/useExportPdf.js", {
    react: { useState(initial) { const slot = index++; if (!(slot in states)) states[slot] = initial; return [states[slot], value => { states[slot] = value; }]; }, useRef(initial) { return refs[refIndex++] ||= { current: initial }; } },
    "./PdfPreviewProvider": { usePdfPreview: () => ({ previewPdf: (request) => { previews.push(request); return controller.open(request); } }) },
  }, { fetch: async (...args) => { requests.push(args); if (response instanceof Error) throw response; return response; } }).default;
  const file = kind === "summary" ? "components/summary-reports-ui/useSummaryReportPdf.js" : "components/weekly-narratives-ui/WeeklyNarrativesPrintButton.js";
  const Wrapper = kind === "generic" ? Hook : load(file, { "../ui/useExportPdf": Hook }).default;
  function render() { index = 0; refIndex = 0; return kind === "generic" ? Wrapper({ endpoint: "/api/reports/annex-c", params: { reportId: "report 1", ignored: null } }) : kind === "summary" ? Wrapper(internshipId) : Wrapper({ internshipId }); }
  return { states, previews, requests, controller, render, async run() { const output = render(); await (kind === "generic" ? output.handleExport() : kind === "summary" ? output.printReport() : output.props.children.props.onClick()); } };
}

test("every PDF export caller opens a preview once without starting a download or opening a tab", async () => {
  for (const kind of ["generic", "summary", "narratives"]) {
    const response = new Response("%PDF-demo", { headers: { "Content-Disposition": 'attachment; filename="report.pdf"' } });
    const h = exporter(kind, response); await h.run();
    assert.equal(h.previews.length, 1); assert.equal(h.requests.length, 1); assert.equal(h.states[0], false);
    const state = h.controller.getSnapshot(); assert.equal(state.status, "ready"); assert.equal(state.document.filename, "report.pdf");
    assert.equal(await state.document.blob.text(), "%PDF-demo");
    assert.ok(h.requests[0][0].includes(kind === "generic" ? "reportId=report+1" : internshipId));
    h.controller.close();
  }
});

test("failed exports preserve status and busy/timeout codes inside the preview modal", async () => {
  for (const kind of ["generic", "summary", "narratives"]) {
    for (const [status, code] of [[403, "FORBIDDEN"], [503, "PDF_BUSY"], [504, "PDF_TIMEOUT"]]) {
      const h = exporter(kind, Response.json({ error: "Please try again.", code }, { status })); await h.run();
      const state = h.controller.getSnapshot(); assert.equal(state.open, true); assert.equal(state.status, "error");
      assert.equal(state.document, null); assert.equal(state.error.status, status); assert.equal(state.error.code, code);
      assert.equal(h.states[0], false); assert.doesNotThrow(h.render); h.controller.close();
    }
    const h = exporter(kind, new Error("fetch failed")); await h.run();
    assert.equal(h.controller.getSnapshot().status, "error"); assert.equal(h.states[0], false); h.controller.close();
  }
});
