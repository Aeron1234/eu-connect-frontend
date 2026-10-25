import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks = {}) {
  const url = new URL("../" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, require(id) {
    return Object.hasOwn(mocks, id) ? mocks[id] : require(id);
  } });
  return compiled.exports;
}
const e = React.createElement;
const Link = ({ children, ...props }) => e("a", props, children);
const Cards = load("components/dashboard-ui/DashboardStats.js", { "next/link": Link }).default;
const StudentStats = load("components/dashboard-ui/StudentDashboardStats.js", {
  "@/components/dashboard-ui/DashboardStats": Cards,
}).default;
const render = stats => renderToStaticMarkup(e(StudentStats, { data: { stats } }));

test("student missing-requirements card opens Storage and keeps existing statistics", () => {
  const html = render({ favoriteInternships: 5, unreadAnnouncements: 3, documentsStored: 9, hasOngoingInternship: true, missingRequirements: 2 });
  assert.match(html, /Favorite Internships/);
  assert.match(html, /Unread Announcements/);
  assert.match(html, /Documents Stored/);
  assert.match(html, /<a[^>]*href="\/student\/storage"[^>]*>[\s\S]*Missing Requirements[\s\S]*>2<\/p>/);
  assert(!html.includes("Pending Evaluations"));
});

test("zero missing, absent internship, and unavailable counts are distinct dashboard states", () => {
  const complete = render({ hasOngoingInternship: true, missingRequirements: 0 });
  assert.match(complete, /Missing Requirements[\s\S]*>0<\/p>/);
  assert(!complete.includes("No ongoing internship"));
  const absent = render({ hasOngoingInternship: false, missingRequirements: null });
  assert.match(absent, /No ongoing internship/);
  assert(!absent.includes("still to complete"));
  const unavailable = render({});
  assert.match(unavailable, /Requirement count could not be loaded/);
  assert(!unavailable.includes("No ongoing internship"));
});

test("document mutations invalidate this student's dashboard and document caches without touching other users", async () => {
  const tab = (user, record, name) => ["internship-records", String(user), "detail", String(record), name];
  const role = (user, name) => ["dashboard-overview", String(user), name];
  const { invalidateCurrentInternshipDocuments, currentInternshipDocumentsKeys } = load("lib/cache/current-internship-documents-queries.js", {
    "@/lib/server-actions/internship-docs-actions": {},
    "./dashboard-overview-queries": { dashboardOverviewKeys: { role } },
    "./internship-record-details-queries": { internshipRecordDetailsKeys: { tab } },
  });
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  const changed = [currentInternshipDocumentsKeys.files("student", "ongoing"), tab("student", "ongoing", "documents"), role("student", "student")];
  const retained = [role("other", "student"), role("student", "employer"), tab("student", "past", "documents")];
  for (const key of [...changed, ...retained]) client.setQueryData(key, { saved: true });
  try {
    await invalidateCurrentInternshipDocuments(client, "student", "ongoing");
    for (const key of changed) assert.equal(client.getQueryState(key).isInvalidated, true);
    for (const key of retained) assert.equal(client.getQueryState(key).isInvalidated, false);
  } finally { client.clear(); }
});

test("Storage checklist agrees with requirement counts for pending and accepted employer files", () => {
  const icon = label => () => e("span", { "data-check": label });
  const Checklist = load("components/internship-docs-ui/InternshipRequirementsType.js", {
    "lucide-react": { CheckCircle2: icon("complete"), Circle: icon("missing"), FileCheck: icon("file"), FileText: icon("text") },
  }).default;
  const requirements = [{ id: 1, category: "before", name: "First" }, { id: 2, category: "after", name: "Second" }];
  const markup = status => renderToStaticMarkup(e(Checklist, { requirementTypes: requirements, docs: [
    { requirement_type_id: "1", verification_status: null },
    { requirement_type_id: 2, verification_status: status },
  ] }));
  for (const status of ["pending", "rejected"]) {
    assert.equal((markup(status).match(/data-check="complete"/g) || []).length, 1);
    assert.equal((markup(status).match(/data-check="missing"/g) || []).length, 1);
  }
  assert.equal((markup("accepted").match(/data-check="complete"/g) || []).length, 2);
});
