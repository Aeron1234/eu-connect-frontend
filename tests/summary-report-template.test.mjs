import { test } from "node:test";
import assert from "node:assert/strict";
import { summaryReportHtml } from "../app/_services/summaryReportTemplate.js";

const report = {
  student_name: "Jane <Student>",
  company_name: "Company & Co.",
  organization_experience: "I learned <script>alert(1)</script>",
  work_schedule: "Weekdays",
  memorable_moment: "Team project",
  difficulties_solutions: "Asked my mentor",
  memorabilia_note: "My photo",
  attachment_name: "day-one.png",
};

test("print template uses the required document format and escapes report text", () => {
  const html = summaryReportHtml(report);
  assert.match(html, /@page \{ size: A4 portrait; margin: 1cm; \}/);
  assert.match(html, /font-size: 12pt; line-height: 1\.5/);
  assert.match(html, /text-align: left; font-size: 13pt/);
  assert.match(html, /text-indent: 1cm/);
  assert.match(html, /Working in the Organization\/Company/);
  assert.match(html, /Jane &lt;Student&gt;/);
  assert.match(html, /Company &amp; Co\./);
  assert.doesNotMatch(html, /<script>/);
});

test("image memorabilia is embedded as an image in the printable document", () => {
  const html = summaryReportHtml({ ...report, attachment_name: null }, [
    "data:image/png;base64,dGVzdA==",
    "data:image/jpeg;base64,c2Vjb25k",
  ]);
  assert.match(html, /<img src="data:image\/png;base64,dGVzdA=="/);
  assert.match(html, /<img src="data:image\/jpeg;base64,c2Vjb25k"/);
  assert.match(html, /max-width: 60mm; max-height: 35mm/);
  assert.doesNotMatch(html, /Supplemental file:/);
  assert.doesNotMatch(html, /day-one\.png/);
});

test("non-image attachments are mentioned without printing their filename", () => {
  const html = summaryReportHtml(report);
  assert.match(html, /A supplemental file is available with the digital report/);
  assert.doesNotMatch(html, /day-one\.png/);
});
