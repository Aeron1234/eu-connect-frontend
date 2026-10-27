import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as display from "../lib/activity-log-display.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const sample = {
  id: "log-1", actor_name: "Department Head", actor_role: "department_head",
  action: "alumni_internship_record_updated", target_type: "alumni_internship_records", target_id: "private-record-id",
  description: "Department head updated the alumni record for Ana Cruz at Acme (company_name, course_id, accumulated_hours).",
  metadata: { changed_fields: ["company_name", "course_id", "accumulated_hours"] }, created_at: "2026-10-26T00:00:00Z",
};
function load(file, mocks) {
  const url = new URL("../" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return compiled.exports;
}
const formatting = load("components/activity-logs-ui/activityLogFormatting.js", { "@/lib/activity-log-display.mjs": display });
const Row = load("components/activity-logs-ui/ActivityLogRow.js", {
  "./activityLogFormatting": formatting,
  "../ui/Modal": () => null, "../ui/DeleteForm": () => null,
}).default;

test("old update messages become readable without changing their stored codes, IDs or metadata", () => {
  for (const metadata of [sample.metadata, JSON.stringify(sample.metadata)]) {
    const log = { ...sample, metadata }, before = JSON.stringify(log);
    assert.equal(display.activityDescription(log), "Department head updated the alumni record for Ana Cruz at Acme.");
    assert.deepEqual(display.activityUpdateFields(log), ["Company name", "Course", "Completed hours"]);
    assert.equal(JSON.stringify(log), before);
    const html = renderToStaticMarkup(React.createElement(Row, { log }));
    assert(html.includes("View update details")); assert(html.includes("Fields included in the update"));
    assert(html.includes("Company name")); assert(html.includes("Completed hours")); assert(html.includes("Past internships"));
    assert(!html.includes("course_id")); assert(!html.includes("accumulated_hours")); assert(!html.includes("private-record-id"));
  }
});

test("readable summaries are shared across announcements and internship-post updates, including old dashboards without metadata", () => {
  for (const action of ["announcement_updated", "internship_posting_updated", "alumni_internship_record_updated"]) {
    const log = { action, description: 'Updated "Company (Philippines)" (company_name, course_id).', metadata: null };
    assert.equal(display.activityDescription(log), 'Updated "Company (Philippines)".');
  }
  for (const description of ["Updated an alumni record for Company (Philippines).", "Updated a record for Company (2026)."]) {
    assert.equal(display.activityDescription({ ...sample, description, metadata: null }), description);
  }
  const unrelated = { action: "internship_posting_created", description: "Created a post mentioning (company_name, course_id)." };
  assert.equal(display.activityDescription(unrelated), unrelated.description);
});

test("role, document-stage and report-status legacy templates are humanized only for their matching actions", () => {
  assert.equal(display.activityDescription({ action: "account_created", description: "Admin created a new department_head account for Ana." }), "Admin created a new department head account for Ana.");
  assert.equal(display.activityDescription({ action: "internship_document_deleted", description: 'department_head deleted document "Report".' }), 'Department head deleted document "Report".');
  assert.equal(display.activityDescription({ action: "internship_document_uploaded", description: "Uploaded Report (after) for internship at Acme." }), "Uploaded Report (after deployment) for internship at Acme.");
  assert.equal(display.activityDescription({ action: "program_annual_report_updated", description: "Updated the BSCS annual report (status: draft)." }), "Updated the BSCS annual report and saved it as a draft.");
  const ordinary = { action: "announcement_created", description: "A reminder about department_head and course_id settings." };
  assert.equal(display.activityDescription(ordinary), ordinary.description);
});

test("evaluation action labels match their actual direction and module labels hide database table names", () => {
  assert.equal(display.activityActionLabel("student_evaluation_submitted"), "Performance evaluation submitted");
  assert.equal(display.activityActionLabel("employer_evaluation_submitted"), "Supervisor evaluation submitted");
  assert.equal(display.activityModuleLabel("student_evaluation_masters"), "Performance evaluations");
  assert.equal(display.activityModuleLabel("employer_evaluation_masters"), "Supervisor evaluations");
  assert.equal(display.activityModuleLabel("users"), "Accounts");
  assert.equal(display.activityModuleLabel("program_annual_reports"), "SIPP reports");
  assert.equal(display.activityActionLabel("future_feature_updated"), "Future feature updated");
});

test("missing, malformed and duplicated metadata cannot break the log renderer or show raw course IDs", () => {
  for (const metadata of ["{broken", null, [], false]) {
    assert.doesNotThrow(() => display.activityDescription({ ...sample, metadata }));
    assert.deepEqual(display.activityUpdateFields({ ...sample, metadata }), []);
  }
  assert.deepEqual(display.activityUpdateFields({ ...sample, metadata: { changed_fields: ["course_id", "course_id", null, 42, {}] } }), ["Course"]);
  const details = formatting.postingDetails({ position: "Intern", course_ids: ["private-course-id"], description: { unexpected: true } });
  const serialized = JSON.stringify(details);
  assert(serialized.includes("Eligible courses")); assert(serialized.includes("1 selected"));
  assert(!serialized.includes("private-course-id")); assert(!serialized.includes("[object Object]"));
});


test("rotation activity dates use MM-dd-yyyy without changing stored descriptions or other date text", () => {
  for (const verb of ["Added", "Updated"]) {
    const log = { action: "internship_rotations_updated", description: verb + " the Cyber Security rotation at BDO (2027-01-13 to 2027-01-31)." };
    assert.equal(display.activityDescription(log), verb + " the Cyber Security rotation at BDO (01-13-2027 to 01-31-2027).");
    assert.ok(log.description.includes("2027-01-13"));
    assert.equal(display.activityDescription({ ...log, action: "announcement_created" }), log.description);
  }
  const invalid = { action: "internship_rotations_updated", description: "Added a rotation (2027-02-30 to 2027-03-01)." };
  assert.equal(display.activityDescription(invalid), invalid.description);
  const leap = { action: "internship_rotations_updated", description: "Updated a rotation (2028-02-29 to 2028-03-01)." };
  assert.equal(display.activityDescription(leap), "Updated a rotation (02-29-2028 to 03-01-2028).");
});
