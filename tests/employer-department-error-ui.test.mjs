import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const noop = () => {};
const empty = () => null;
const childrenOnly = ({ children }) => children;
const user = { useUser: () => ({ user: { id: "user-1" } }) };
const select = { Select: childrenOnly, SelectTrigger: empty, SelectContent: empty, SelectItem: empty, SelectValue: empty };
const Link = ({ href, children }) => React.createElement("a", { href }, children);

function query(data, overrides = {}) {
  const result = { data, isError: true, isPending: false, error: Object.assign(new Error("fetch failed"), { status: 503 }),
    retries: 0, nextRetries: 0,
    refetch() { result.retries += 1; }, fetchNextPage() { result.nextRetries += 1; }, ...overrides };
  return result;
}

function fixture(file, mocks, exportName = "default") {
  const errors = [];
  const replacements = {
    "@/components/ui/ErrorUI": (props) => { errors.push(props); return React.createElement("section", null, "Shared error screen"); },
    "@/contexts/UserContext": user, "@/components/ui/skeleton": { Skeleton: empty },
    "@/components/ui/select": select, "next/link": Link, ...mocks,
  };
  const url = new URL(`../components/${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiledModule = { exports: {} };
  vm.runInNewContext(code, {
    module: compiledModule, exports: compiledModule.exports,
    require(id) { return Object.hasOwn(replacements, id) ? replacements[id] : require(id); },
  }, { filename: url.pathname });
  return { errors, render(props = {}) { errors.length = 0; return renderToStaticMarkup(React.createElement(compiledModule.exports[exportName], props)); } };
}

const dashboardCases = [
  { file: "InternsSupervisedCard", listKey: "interns", option: "employerInternsPageOptions", emptyText: "No interns in this category.",
    saved: { interns: [{ internship_id: "record-1", student_id: "student-1", first_name: "Saved", last_name: "Student", status: "ongoing" }], total: 1, page: 1, totalPages: 2 }, text: "Saved Student" },
  { file: "JobsPostedTable", listKey: "jobs", option: "employerJobsPageOptions", emptyText: "No jobs posted yet.",
    saved: { jobs: [{ id: "job-1", position: "Saved position", created_at: "2026-10-20", work_type: "remote" }], totalPages: 2 }, text: "Saved position" },
  { file: "StudentHoursTracker", listKey: "students", option: "studentHoursPageOptions", emptyText: "No active interns yet.",
    saved: { students: [{ id: "record-1", student_id: "student-1", name: "Saved Student", total_hours: 200, accumulated_hours: 20 }], total: 1, page: 1, totalPages: 2 }, text: "Saved Student" },
  { file: "ShiftHoursChart", listKey: "weeks", option: "shiftHoursMonthOptions", emptyText: "No time records for this month.",
    saved: { weeks: [{ week: "Week 1", hours: 8 }] }, text: "Saved chart" },
];

for (const scenario of dashboardCases) {
  test(`${scenario.file} uses ErrorUI, retains cached data, and distinguishes failure from empty or loading`, () => {
    for (const state of ["failed", "cached", "success", "empty", "loading"]) {
      const data = state === "failed" || state === "loading" ? undefined
        : state === "empty" ? { [scenario.listKey]: [] } : scenario.saved;
      const failed = state === "failed" || state === "cached";
      const result = query(data, { isError: failed, error: failed ? new Error("fetch failed") : null, isPending: state === "loading" });
      const queryMocks = { useQuery: () => result, useQueryClient: () => ({}) };
      const view = fixture(`dashboard-ui/${scenario.file}.js`, {
        "@tanstack/react-query": queryMocks,
        "@/lib/cache/dashboard-lists-queries": { [scenario.option]: () => ({}) },
        "@/lib/cache/shift-hours-queries": { shiftHoursMonthOptions: () => ({}) },
        "../ui/ProgressBar": empty,
        "@/components/ui/chart": { ChartContainer: childrenOnly, ChartTooltip: empty, ChartTooltipContent: empty },
        recharts: { CartesianGrid: empty, Line: empty, LineChart: () => "Saved chart", XAxis: empty, YAxis: empty },
      });
      const html = view.render({ initialMonths: [{ month: 10, year: 2026 }] });
      assert.equal(view.errors.length, failed ? 1 : 0, state);
      assert.equal(html.includes(scenario.text), state === "cached" || state === "success", state);
      assert.equal(html.includes(scenario.emptyText), state === "empty", state);
      if (failed) {
        assert.equal(view.errors[0].error, result.error); assert.equal(view.errors[0].compact, true);
        assert.equal(view.errors[0].logError, false); view.errors[0].reset(); assert.equal(result.retries, 1);
      }
      if (scenario.file === "JobsPostedTable" && state === "cached") {
        assert.ok(html.indexOf("Shared error screen") < html.indexOf("<table"), "error stays outside the horizontally scrolling jobs table");
      }
    }
  });
}

test("employer dashboard renders repeated positions inside one student card", () => {
  const result = query({ interns: [{ student_id: "student-1", first_name: "Tsunayoshi", last_name: "Sawada", email: "student@example.test", course_name: "Computer Science", placements: [
    { internship_id: "record-2", internship_position: "AI Agent Engineer", status: "finished", date_started: "2026-08-31", total_hours: 100, accumulated_hours: 103.2 },
    { internship_id: "record-1", internship_position: "SE intern", status: "finished", date_started: "2026-07-27", total_hours: 100, accumulated_hours: 103.6 },
  ] }], total: 1, page: 1, totalPages: 1 }, { isError: false });
  const view = fixture("dashboard-ui/InternsSupervisedCard.js", {
    "@tanstack/react-query": { useQuery: () => result, useQueryClient: () => ({}) },
    "@/lib/cache/dashboard-lists-queries": { employerInternsPageOptions: () => ({}) },
  });
  const html = view.render();
  assert.equal((html.match(/View profile/g) || []).length, 1);
  assert.equal((html.match(/student@example.test/g) || []).length, 1);
  for (const value of ["AI Agent Engineer", "SE intern", "103.2", "103.6", "1 intern"]) assert(html.includes(value), value);
  assert(html.includes('aria-label="Internship positions of Tsunayoshi Sawada"'));
});

test("Annex C errors retain loaded reports and retry the failed page operation", () => {
  for (const state of ["failed", "refresh", "next"]) {
    const result = query(state === "failed" ? undefined : { pages: [] }, { isFetchNextPageError: state === "next" });
    const view = fixture("sipp-reports-ui/AnnexCManager.js", {
      "@/components/ui/ConfirmDialog": empty, "../ui/TabBar": empty,
      "../skeletons/AnnualReportSkeleton": empty, "./AnnexCReportForm": empty, "./AnnexCReportFilters": empty,
      "./AnnexCReportCard": () => "Saved report", "./SippSeeMoreButton": empty,
      "./useAnnexCReports": () => ({ tab: "reports", reportsQuery: result, reports: state === "failed" ? [] : [{ id: 1 }] }),
    });
    const html = view.render(); assert.equal(view.errors.length, 1);
    assert.equal(html.includes("Saved report"), state !== "failed"); assert.ok(!html.includes("No reports found"));
    view.errors[0].reset(); assert.equal(result.nextRetries, state === "next" ? 1 : 0); assert.equal(result.retries, state === "next" ? 0 : 1);
  }
});

test("Annex D errors retain loaded companies and retry the failed page operation", () => {
  for (const state of ["failed", "refresh", "next"]) {
    const result = query(state === "failed" ? undefined : { pages: [] }, { isFetchNextPageError: state === "next" });
    const view = fixture("sipp-reports-ui/AnnexDHteList.js", {
      "../skeletons/HTEListSkeleton": empty, "./AnnexDFilters": empty, "./AnnexDStats": empty,
      "./AnnexDCompanyCard": () => "Saved company", "./SippSeeMoreButton": empty,
      "./useAnnexDHteList": () => ({ companiesQuery: result, companies: state === "failed" ? [] : [{ company_key: "company-1" }] }),
    }, "AnnexDHteList");
    const html = view.render(); assert.equal(view.errors.length, 1);
    assert.equal(html.includes("Saved company"), state !== "failed"); assert.ok(!html.includes("No placements found"));
    view.errors[0].reset(); assert.equal(result.nextRetries, state === "next" ? 1 : 0); assert.equal(result.retries, state === "next" ? 0 : 1);
  }
});

test("SIPP academic-year failures preserve cached Annex D choices and retry only the year query", () => {
  for (const data of [undefined, ["2026-2027"]]) {
    const result = query(data);
    let displayedYears;
    const view = fixture("sipp-reports-ui/SIPPReportsManager.js", {
      react: { ...React, useState: () => ["annex-d", noop] },
      "@tanstack/react-query": { useQuery: () => result },
      "@/lib/cache/sipp-reports-queries": { sippAcademicYearsOptions: () => ({}) },
      "../ui/TabBar": empty, "./AnnexCManager": empty,
      "./AnnexDHteList": { AnnexDHteList: ({ availableAcadYear }) => { displayedYears = availableAcadYear; return "Annex D content"; } },
    });
    const html = view.render(); assert.equal(view.errors.length, 1);
    assert.equal(html.includes("Annex D content"), data !== undefined);
    if (data) assert.equal(displayedYears, data);
    view.errors[0].reset(); assert.equal(result.retries, 1);
  }
});
