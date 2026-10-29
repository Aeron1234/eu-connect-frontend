import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as rotations from "../lib/internship-rotations.mjs";
import { weeklyNarrativesHtml } from "../app/_services/weeklyNarrativesTemplate.js";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const rows = [
  { id: "one", department_name: "Food and Beverage", supervisor_name: "Maria", date_from: "2026-11-01", date_to: "2026-11-07" },
  { id: "two", department_name: "Housekeeping", date_from: "2026-11-08", date_to: "2026-11-14" },
];
function load(file, mocks) {
  const { code } = transformSync(readFileSync(new URL("../" + file, import.meta.url), "utf8"), { filename: file, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) {
    if (id === "@/lib/internship-rotations.mjs") return rotations;
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id === "@/components/skeletons/SelectionRowsSkeleton") return function LoadingSelection({ label }) { return React.createElement("div", { role: "status", "aria-label": label }); };
    return require(id);
  } });
  return mod.exports;
}

test("current assignment uses Philippine midnight and inclusive day boundaries", () => {
  assert.equal(rotations.rotationDay(new Date("2026-10-31T16:00:00Z")), "2026-11-01");
  assert.equal(rotations.currentRotation(rows, "2026-11-07").id, "one");
  assert.equal(rotations.currentRotation(rows, "2026-11-08").id, "two");
  assert.equal(rotations.currentRotation(rows, "2026-11-15"), null);
  assert.equal(rotations.rotationDate("2026-11-01"), "November 1, 2026");
});

test("narrative date ranges suggest every covered rotation and leave gaps unassigned", () => {
  assert.deepEqual(rotations.suggestedRotations(rows, "2026-11-05", "2026-11-10"), ["one", "two"]);
  assert.deepEqual(rotations.suggestedRotations(rows, "2026-11-08", "2026-11-08"), ["two"]);
  assert.deepEqual(rotations.suggestedRotations(rows, "", "2026-11-10"), []);
  assert.deepEqual(rotations.suggestedRotations(rows, "2026-12-01", "2026-12-10"), []);
  assert.deepEqual(rotations.rotationSnapshots(null), []);
  assert.deepEqual(rotations.rotationSnapshots("broken"), []);
});

test("printed assignments use saved snapshots, escape names and omit the field on ordinary journals", () => {
  const saved = { ...rows[0], department_name: "Food <script>", supervisor_name: "Maria & Co" };
  const narrative = { week_number: 1, narrative: "Work", rotation_assignments: JSON.stringify([saved, rows[1]]) };
  const html = weeklyNarrativesHtml({ company_name: "Company", narratives: [narrative] });
  assert.match(html, /Food &lt;script&gt;/); assert.match(html, /Maria &amp; Co/); assert.match(html, /Housekeeping/);
  assert.doesNotMatch(html, /<script>/);
  const plain = weeklyNarrativesHtml({ company_name: "Company", narratives: [{ week_number: 1, narrative: "Work" }] });
  assert.doesNotMatch(plain, /Company department\(s\)/);
});

test("picker suggests both units and blocks submission on failed reads instead of silently clearing assignments", () => {
  const mocks = { "@/lib/hooks/useInternshipRotations": () => ({ data: { enabled: true, rotations: rows } }), "./NarrativeRotations": () => null };
  const Picker = load("components/weekly-narratives-ui/NarrativeRotationPicker.js", mocks).default;
  const html = renderToStaticMarkup(React.createElement(Picker, { internshipId: "record", from: "2026-11-05", to: "2026-11-10" }));
  assert.equal((html.match(/checked=""/g) || []).length, 2);
  assert.match(html, /name="rotation_ids"/);
  const Failed = load("components/weekly-narratives-ui/NarrativeRotationPicker.js", { ...mocks, "@/lib/hooks/useInternshipRotations": () => ({ isError: true, refetch() {} }) }).default;
  const failed = renderToStaticMarkup(React.createElement(Failed, { internshipId: "record" }));
  assert.match(failed, /Try again/); assert.match(failed, /required=""/); assert.doesNotMatch(failed, /name="rotation_ids"/);
});

test("ordinary internships hide picker controls, disabled tracking retains saved assignments", () => {
  const Picker = load("components/weekly-narratives-ui/NarrativeRotationPicker.js", {
    "@/lib/hooks/useInternshipRotations": () => ({ data: { enabled: false, rotations: [] } }),
    "./NarrativeRotations": () => "Saved company assignment",
  }).default;
  assert.equal(renderToStaticMarkup(React.createElement(Picker, { internshipId: "record" })), "");
  const saved = renderToStaticMarkup(React.createElement(Picker, { internshipId: "record", data: { rotation_assignments: rows } }));
  assert.match(saved, /Saved company assignment/); assert.doesNotMatch(saved, /name="rotation_ids"/);
});

test("narrative picker includes assignments after the internship estimate and displays readable dates", () => {
  const Picker = load("components/weekly-narratives-ui/NarrativeRotationPicker.js", {
    "@/lib/hooks/useInternshipRotations": () => ({ data: { enabled: true, dateStarted: "2026-10-01", dateEnded: "2026-10-31", rotations: rows } }),
    "./NarrativeRotations": () => null,
  }).default;
  const html = renderToStaticMarkup(React.createElement(Picker, { internshipId: "record", from: "2026-11-05", to: "2026-11-10" }));
  assert.equal((html.match(/checked=""/g) || []).length, 2);
  assert.match(html, /November 1, 2026/); assert.match(html, /November 14, 2026/);
  assert.doesNotMatch(html, /disabled=""/); assert.match(html, /estimated internship end date/);
  assert.equal(rotations.currentRotation(rows, "2026-11-05").id, "one");
});

test("printed journals keep original assignments beyond the estimate after the live timeline is changed or removed", () => {
  const saved = { ...rows[0] };
  const record = { company_name: "Hotel", status: "finished", date_ended: "2026-10-31", narratives: [{ week_number: 4, title: "Extended internship", narrative: "Worked in the company unit", date_from: "2026-11-01", date_to: "2026-11-07", rotation_assignments: JSON.stringify([saved]) }] };
  const original = weeklyNarrativesHtml(record);
  for (const live of [[], [{ ...saved, department_name: "Renamed company unit", date_from: "2026-12-01", date_to: "2026-12-07" }]]) {
    const html = weeklyNarrativesHtml({ ...record, rotations: live });
    assert.equal(html, original); assert.match(html, /Food and Beverage/); assert.match(html, /November 1, 2026/);
    assert.doesNotMatch(html, /Renamed company unit/);
  }
});

test("text-only narrative edits retain assignment snapshots even after timeline dates/names change", () => {
  const Picker = load("components/weekly-narratives-ui/NarrativeRotationPicker.js", {
    "@/lib/hooks/useInternshipRotations": () => ({ data: { enabled: true, rotations: [{ ...rows[0], department_name: "Renamed unit", date_from: "2026-12-01", date_to: "2026-12-07" }] } }),
    "./NarrativeRotations": () => null,
  }).default;
  const html = renderToStaticMarkup(React.createElement(Picker, { internshipId: "record", from: "2026-11-01", to: "2026-11-07", data: { date_from: "2026-11-01", date_to: "2026-11-07", rotation_assignments: [rows[0]] } }));
  assert.match(html, /Food and Beverage/); assert.doesNotMatch(html, /Renamed unit/); assert.match(html, /checked=""/);
});

test("timeline is read-only for employers/staff and exposes opt-in only to authorized students", () => {
  let snapshot = { enabled: true, rotations: rows, canManage: false, status: "ongoing" };
  let refreshError = false;
  const empty = () => null;
  const Section = load("components/internship-records-ui/CompanyRotations.js", {
    "@/lib/hooks/useInternshipRotations": () => ({ data: snapshot, isError: refreshError }),
    "@tanstack/react-query": { useQueryClient: () => ({}) }, "@/contexts/UserContext": { useUser: () => ({ user: { id: "viewer" } }) },
    "@/lib/server-actions/rotations-actions": {}, "@/lib/helpers": {},
    "@/lib/cache/student-records-queries": {}, "@/lib/cache/weekly-narratives-queries": {}, "@/lib/cache/student-storage-queries": {},
    "@/components/skeletons/CompanyRotationsSkeleton": empty,
    "@/components/help-ui/HelpManual": empty,
    "../ui/Modal": empty, "../ui/ModalForm": {}, "../ui/ErrorUI": empty,
    "../ui/button": { Button: ({ children, ...props }) => { delete props.variant; delete props.size; return React.createElement("button", props, children); } },
  }).default;
  const readonly = renderToStaticMarkup(React.createElement(Section, { internshipId: "record", readOnly: true }));
  assert.match(readonly, /Housekeeping/); assert.doesNotMatch(readonly, /Add rotation|Turn off|Edit Housekeeping|Delete Housekeeping/);
  refreshError = true;
  snapshot = { ...snapshot, canManage: true };
  const stale = renderToStaticMarkup(React.createElement(Section, { internshipId: "record" }));
  assert.match(stale, /Housekeeping|Showing previously loaded assignments/);
  assert.match(stale, /Refresh failed/);
  assert.doesNotMatch(stale, /Turn off|Add rotation|Edit Housekeeping/);
  refreshError = false;
  snapshot = { enabled: false, rotations: [], canManage: false };
  assert.equal(renderToStaticMarkup(React.createElement(Section, { internshipId: "record", readOnly: true })), "");
  snapshot = { ...snapshot, canManage: true };
  assert.match(renderToStaticMarkup(React.createElement(Section, { internshipId: "record" })), /Enable rotations/);
});
