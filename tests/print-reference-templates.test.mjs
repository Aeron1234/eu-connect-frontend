import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { studentEvaluationHtml } from "../app/_services/templates/studentEvaluationTemplate.js";
import { annexCHtml } from "../app/_services/templates/annexCTemplate.js";
import { annexDHtml } from "../app/_services/templates/annexDTemplate.js";
import { printFontCss } from "../app/_services/templates/printDocumentShared.js";

// Avoid including embedded fonts in failed-assertion diagnostics.
const readable = (html) => html.replace(/data:[^"\s]+/g, "embedded-asset");
const base = { ay: "2026-2027", hei: "School & Inc.", address: "Candelaria", preparedBy: "A <B>", certifiedBy: "C & D" };

test("Times New Roman regular and bold are embedded, without a font network request", () => {
  const faces = [...printFontCss.matchAll(/font-weight: (\d+); src: url\("data:font\/ttf;base64,([^\"]+)/g)];
  assert.deepEqual(faces.map((face) => face[1]), ["400", "700"]);
  for (const face of faces) assert.equal(Buffer.from(face[2], "base64").readUInt32BE(0), 0x00010000);
  assert(!/https?:/.test(printFontCss));
});

test("evaluation uses the reference letter, scale, single-spaced portrait form and escaped scores", () => {
  const html = readable(studentEvaluationHtml({
    departmentName: "IT & Computing", studentName: "PRIVATE STUDENT", companyName: "PRIVATE COMPANY",
    categories: [{ category: "1. Personality", items: [{ criterion_name: "Grooming <script>", score: 0 }] }],
    remarks: "Good & reliable\nSecond line",
  }));
  assert.match(html, /size: A4 portrait; margin: 1in/);
  assert.match(html, /font-size: 12pt; line-height: 1/);
  assert.match(html, /What have our students attained so far/);
  assert.match(html, /INSTRUCTION:/);
  assert.match(html, /NUMERICAL GRADE/);
  assert.match(html, /IT &amp; Computing/);
  assert.match(html, /1\. PERSONALITY/);
  assert.doesNotMatch(html, /1\. 1\./);
  assert.match(html, /Grooming &lt;script&gt;/);
  assert.match(html, /class="item-line">0<\/span>/);
  assert.match(html, /Good &amp; reliable\nSecond line/);
  assert.match(html, /2\. OTHER REMARKS:/);
  assert.doesNotMatch(html, /PRIVATE STUDENT|PRIVATE COMPANY|ALDWIN|Arial|Georgia/);
  assert.match(html, /table-header-group/);
});

test("both registrar reports use legal landscape, reference font sizes and escaped signatures", () => {
  const forms = [annexCHtml({ ...base, degreeProgram: "Computer Science", rows: [{ issues: "<script>", solutions: "Fix & retry", recommendations: "Review" }] }),
    annexDHtml({ ...base, company: { name: "Company <Co>", interns: [{ name: "Jane <Doe>", course: "BSCS", gender: "female", date_started: "2027-01-25", date_ended: "2027-03-24" }] } })];
  for (const form of forms) {
    const html = readable(form);
    assert.match(html, /size: 14in 8\.5in; margin: 1cm 1in/);
    assert.match(html, /font-size: 11pt/);
    assert.match(html, /font-size: 13pt/);
    assert.match(html, /font-size: 12pt/);
    assert.match(html, /color: #710000/);
    assert.match(html, /A &lt;B&gt;/);
    assert.match(html, /C &amp; D/);
    assert.match(html, /table-header-group/);
    assert.doesNotMatch(html, /<script>/);
  }
  assert.match(readable(forms[0]), /Annex &ldquo;C&rdquo;/);
  assert.match(readable(forms[1]), /Jane &lt;Doe&gt;/);
  assert.match(readable(forms[1]), /January 25, 2027 - March 24, 2027/);
});

test("report generators honor template paper size and evaluation portrait orientation", () => {
  for (const [name, landscape] of [["studentEvaluation", false], ["annexC", true], ["annexD", true]]) {
    const source = readFileSync(new URL(`../app/_services/reports/${name}Pdf.js`, import.meta.url), "utf8");
    assert(source.includes(`renderPdf(html, { landscape: ${landscape}, preferCSSPageSize: true })`));
  }
});
