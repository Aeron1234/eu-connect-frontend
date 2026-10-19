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
const user = { useUser: () => ({ user: { id: "admin-1" } }) };

function failedQuery(data) {
  const query = { data, isError: true, isPending: false, error: Object.assign(new Error("fetch failed"), { status: 503 }),
    retries: 0, nextRetries: 0,
    refetch() { query.retries += 1; }, fetchNextPage() { query.nextRetries += 1; } };
  return query;
}

function fixture(file, mocks) {
  const errors = [];
  const replacements = {
    "@/components/ui/ErrorUI": (props) => { errors.push(props); return React.createElement("section", null, "Shared error screen"); },
    "@/components/ui/ConfirmDialog": empty, "@/components/ui/PageTitle": empty,
    "@/components/ui/PageManual": empty, ...mocks,
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
  return { errors, render(props = {}) { errors.length = 0; return renderToStaticMarkup(React.createElement(compiledModule.exports.default, props)); } };
}

test("activity logs preserve cached rows and retry the failed read or next-page request", () => {
  for (const nextPage of [false, true]) {
    const query = failedQuery({ pages: [] }); query.isFetchNextPageError = nextPage;
    const view = fixture("activity-logs-ui/ActivityLogsManager.js", {
      "../ui/PageTitle": empty, "../ui/PageManual": empty,
      "../skeletons/ActivityLogsTableSkeleton": empty,
      "./ActivityLogsSummary": empty, "./ActivityLogsFilters": empty,
      "./ActivityLogsBatchDelete": empty, "./ActivityLogsTable": () => "Saved logs",
      "./useActivityLogsManager": () => ({ logsQuery: query, logs: [{ id: 1 }] }),
    });
    assert.ok(view.render().includes("Saved logs")); assert.equal(view.errors.length, 1);
    assert.equal(view.errors[0].error, query.error); assert.equal(view.errors[0].compact, true);
    view.errors[0].reset(); assert.equal(query.nextRetries, nextPage ? 1 : 0); assert.equal(query.retries, nextPage ? 0 : 1);
  }
});

test("accounts preserve loaded rows and retry the failed page while retaining original error status", () => {
  for (const nextPage of [false, true]) {
    const query = failedQuery({ pages: [{ accounts: [{ id: 1 }] }] }); query.isFetchNextPageError = nextPage;
    const view = fixture("account-ui/AccountsManager.js", {
      react: { ...React, useState: (value) => [value === "Form" ? "Accounts" : value, noop] },
      "@tanstack/react-query": { useQuery: () => ({ data: {} }), useInfiniteQuery: () => query, useQueryClient: () => ({}) },
      "@/contexts/UserContext": user,
      "@/lib/cache/accounts-queries": { accountsInfiniteOptions: () => ({}) },
      "@/lib/cache/account-form-queries": { accountFormOptions: () => ({}) },
      "@/lib/see-more-pagination.mjs": {}, "./CreateAccountForm": empty,
      "./ExistingAccountList": () => "Saved accounts", "../skeletons/ExistingAccountListSkeleton": empty,
      "../skeletons/CreateAccountFormSkeleton": empty, "../ui/SearchBar": empty, "./AccountDropdownFilter": empty,
    });
    assert.ok(view.render().includes("Saved accounts")); assert.equal(view.errors.length, 1);
    assert.equal(view.errors[0].error, query.error);
    view.errors[0].reset(); assert.equal(query.nextRetries, nextPage ? 1 : 0); assert.equal(query.retries, nextPage ? 0 : 1);
  }
});

test("cache monitoring keeps the last snapshot and offers ErrorUI retry on a failed refresh", () => {
  for (const snapshot of [null, { processMemoryBytes: 10 }]) {
    let retries = 0;
    const view = fixture("cache-monitoring-ui/CacheMonitoringDashboard.js", {
      "./useCacheMonitoring": () => ({ snapshot, error: "fetch failed", refresh: () => { retries += 1; }, view: {} }),
      "./CacheMonitoringHeader": empty, "./CacheProcessStatus": empty,
      "./CacheMonitoringSummary": () => "Saved metrics", "./CacheRoutesSection": empty, "./CacheDiagnostics": empty,
    });
    const html = view.render(); assert.equal(view.errors.length, 1);
    assert.equal(html.includes("Saved metrics"), Boolean(snapshot));
    view.errors[0].reset(); assert.equal(retries, 1);
  }
});

test("error tracking refresh failures preserve groups and invalidate their query family on retry", () => {
  const query = failedQuery({ stats: { totalOccurrences: 1, totalGroups: 1 }, data: [{ fingerprint: "group-1" }] });
  const invalidations = [];
  const view = fixture("error-tracking-ui/ErrorTrackingDashboard.js", {
    "@tanstack/react-query": { useQuery: () => query, useQueryClient: () => ({ invalidateQueries: (value) => invalidations.push(value) }) },
    "@/contexts/UserContext": user,
    "@/lib/cache/error-tracking-queries": { errorGroupsOptions: () => ({}), errorTrackingKeys: { all: (id) => ["errors", id] } },
    "@/components/ui/skeleton": {},
    "@/components/ui/select": { Select: childrenOnly, SelectTrigger: empty, SelectValue: empty, SelectContent: empty, SelectItem: empty },
    "@/lib/helpers": {}, "@/lib/server-actions/error-tracking-actions": {}, "@/lib/error-tracking-results.mjs": {},
    "./ErrorGroupCard": () => "Saved error group",
  });
  assert.ok(view.render().includes("Saved error group")); assert.equal(view.errors[0].error, query.error);
  view.errors[0].reset(); assert.equal(invalidations.length, 1);
  assert.deepEqual([...invalidations[0].queryKey], ["errors", "admin-1"]);
});

test("expanded error groups use ErrorUI without losing cached occurrences", () => {
  for (const data of [undefined, { count: 1, occurrences: [{ id: 1, message: "Saved occurrence" }] }]) {
    const query = failedQuery(data);
    const view = fixture("error-tracking-ui/ErrorGroupCard.js", {
      "@tanstack/react-query": { useQuery: () => query },
      "@/lib/cache/error-tracking-queries": { errorGroupOptions: () => ({}) }, "@/components/ui/skeleton": {},
    });
    const html = view.render({ item: { fingerprint: "group-1", route_pattern: "/api/v1/example" }, expanded: true, userId: "admin-1" });
    assert.equal(view.errors.length, 1); assert.equal(html.includes("Saved occurrence"), Boolean(data));
    assert.equal(view.errors[0].compact, true); view.errors[0].reset(); assert.equal(query.retries, 1);
  }
});

test("criteria refresh failures keep saved sections and retry the criteria query", () => {
  const query = failedQuery([]);
  const view = fixture("evaluations-ui/EvaluationCriteriaPageContent.js", {
    "../skeletons/EvaluationCriteriaListSkeleton": empty, "./EvaluationCriteriaToolbar": empty,
    "./EvaluationCriteriaSectionCard": () => "Saved criterion", "./AddCriteriaSection": empty,
    "./useEvaluationCriteriaManager": () => ({ criteriaQuery: query, visibleSections: [{ id: 1 }] }),
  });
  assert.ok(view.render().includes("Saved criterion")); assert.equal(view.errors.length, 1);
  view.errors[0].reset(); assert.equal(query.retries, 1);
});

test("department and course failures show a retry for either dataset while keeping the selected table", () => {
  for (const selected of ["departments", "courses"]) {
    for (const failed of ["departments", "courses"]) {
      const departments = failed === "departments" ? failedQuery([]) : { data: [] };
      const courses = failed === "courses" ? failedQuery([]) : { data: [] };
      const view = fixture("departments-and-courses-ui/DepartmentAndCoursesManager.js", {
        "./DepartmentForm": empty, "./CourseForm": empty, "./DepartmentCourseFilters": empty,
        "./DepartmentCourseEditDialog": empty,
        "./DepartmentCourseTables": { DepartmentsTable: () => "Saved departments", CoursesTable: () => "Saved courses" },
        "./useDepartmentCoursesManager": () => ({ view: selected, departmentsQuery: departments, coursesQuery: courses }),
      });
      assert.ok(view.render().includes(`Saved ${selected}`)); assert.equal(view.errors.length, 1);
      const query = failed === "departments" ? departments : courses;
      assert.equal(view.errors[0].error, query.error); view.errors[0].reset(); assert.equal(query.retries, 1);
    }
  }
});

test("batch-delete preview errors use compact ErrorUI and retry counting without deleting", async () => {
  const error = new Error("fetch failed"), previews = [];
  let deletes = 0, stateIndex = 0;
  const states = [true, "2026-10-01", "2026-10-02", false, error, null, null];
  const view = fixture("activity-logs-ui/ActivityLogsBatchDelete.js", {
    react: { ...React, useState: () => [states[stateIndex++], noop] },
    "@/components/ui/dialog": { Dialog: childrenOnly },
    "@/components/ui/button": { Button: childrenOnly }, "@/components/ui/FormDialogContent": childrenOnly,
    "@/components/ui/ModalForm": { Root: childrenOnly, Section: childrenOnly, Row: childrenOnly, Field: childrenOnly, Input: empty, Footer: childrenOnly },
    "@/lib/server-actions/activity-logs-actions": { previewActivityLogBatchDelete: async (range) => { previews.push(range); return { success: true, count: 1 }; } },
  });
  view.render({ onDelete: () => { deletes += 1; } });
  assert.equal(view.errors[0].compact, true); assert.equal(view.errors[0].error, error);
  await view.errors[0].reset(); await Promise.resolve();
  assert.equal(previews.length, 1); assert.equal(previews[0].fromDate, "2026-10-01");
  assert.equal(previews[0].throughDate, "2026-10-02"); assert.equal(deletes, 0);
});
