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
const user = { useUser: () => ({ user: { id: "student-1" } }) };
const files = ({ filtered }) => React.createElement("p", null, filtered.length ? "Saved files" : "No files");

function query(overrides = {}) {
  const result = { isPending: false, isError: false, data: undefined, retries: 0,
    refetch: () => { result.retries += 1; }, ...overrides };
  return result;
}

function fixture(file, mocks = {}) {
  const errors = [];
  const captureError = (props) => {
    errors.push(props);
    return React.createElement("section", null, "Shared error screen");
  };
  const filename = new URL(`../components/${file}`, import.meta.url).pathname;
  const source = transformSync(readFileSync(new URL(`../components/${file}`, import.meta.url), "utf8"), {
    filename, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  }).code;
  const replacements = { "@/components/ui/ErrorUI": captureError, ...mocks };
  const compiledModule = { exports: {} };
  vm.runInNewContext(source, {
    module: compiledModule, exports: compiledModule.exports, process,
    require(id) { return Object.hasOwn(replacements, id) ? replacements[id] : require(id); },
  }, { filename });
  return { errors,
    render(props = {}) { errors.length = 0; return renderToStaticMarkup(React.createElement(compiledModule.exports.default, props)); } };
}

test("current storage load failures show ErrorUI and retry only the document query", () => {
  for (const data of [undefined, [{ id: "file-1" }]]) {
    const failed = query({ isError: true, error: new Error("fetch failed"), data });
    const view = fixture("internship-docs-ui/RecordsDocuments.js", {
      "./InternshipRequirementsType": () => null, "./SearchedStudentFiles": files,
      "../skeletons/RecordsDocumentsSkeleton": () => null, "./DocumentsToolbar": () => null,
      "@/lib/utils": {},
      "./useRecordsDocuments": () => ({ isCurrentStorage: true, filesQuery: failed, docs: data || [], filtered: data || [] }),
    });
    const html = view.render();
    assert.equal(view.errors.length, 1); assert.equal(view.errors[0].error, failed.error);
    assert.equal(view.errors[0].compact, true); assert.equal(view.errors[0].logError, false);
    view.errors[0].reset(); assert.equal(failed.retries, 1);
    assert.equal(html.includes("Saved files"), data !== undefined);
    assert.equal(html.includes("No files"), false);
  }
});

test("expanded past storage failures use ErrorUI and retain files after a failed refresh", () => {
  for (const data of [undefined, [{ id: "file-1" }]]) {
    const failed = query({ isError: true, error: new Error("network error"), data });
    const view = fixture("internship-docs-ui/PastInternshipDocumentRow.js", {
      "./SearchedStudentFiles": files, "./PastInternshipStatusPill": () => null,
      "./PastInternshipFilesSkeleton": () => null,
      "./usePastInternshipFiles": () => ({ expanded: true, setExpanded: noop, filesQuery: failed }),
      "@/lib/server-actions/internship-docs-actions": {}, "@/lib/utils": {},
    });
    const html = view.render({ record: { id: "record-1", company_name: "Company", status: "finished" } });
    assert.equal(view.errors.length, 1); assert.equal(view.errors[0].error, failed.error);
    view.errors[0].reset(); assert.equal(failed.retries, 1);
    assert.equal(html.includes("Saved files"), data !== undefined);
  }
});

test("storage refresh ErrorUI preserves cached sections and retries all failed dependencies", () => {
  const active = query({ data: { id: "record-1" } });
  const types = query({ isError: true, error: new Error("fetch failed"), data: [] });
  const past = query({ isError: true, error: new Error("server error"), data: [] });
  const view = fixture("internship-docs-ui/StudentStoragePageContent.js", {
    "./PastInternshipDocuments": () => "Past documents", "./CurrentInternshipDocuments": () => "Current documents",
    "./StudentStorageHeader": () => null,
    "@/components/skeletons/RecordsDocumentsSkeleton": () => null,
    "@/components/skeletons/PastInternshipDocumentsSkeleton": () => null,
    "./useStudentStorage": () => ({ activeQuery: active, typesQuery: types, pastQuery: past, refreshError: true }),
  });
  const html = view.render(); assert.equal(view.errors.length, 1);
  assert.equal(view.errors[0].error, types.error);
  assert.ok(html.includes("Current documents")); assert.ok(html.includes("Past documents"));
  view.errors[0].reset(); assert.equal(active.retries, 0); assert.equal(types.retries, 1); assert.equal(past.retries, 1);
});

test("dashboard time-record failures use the shared screen instead of an empty table", () => {
  const failed = query({ isError: true, error: new Error("fetch failed") });
  const view = fixture("dtr-ui/StudentDtrHistory.js", {
    "@tanstack/react-query": { useQuery: () => failed, useQueryClient: () => ({}) },
    "@/contexts/UserContext": user, "@/lib/cache/dtr-queries": { studentDtrPageOptions: () => ({}) },
    "./DtrTable": () => "Time table", "./DtrPagination": () => null,
    "@/components/skeletons/DtrRecordsSkeleton": () => null,
  });
  assert.ok(!view.render({ internshipId: "record-1" }).includes("Time table"));
  assert.equal(view.errors[0].error, failed.error); view.errors[0].reset(); assert.equal(failed.retries, 1);
});

test("account avatar loading uses ErrorUI even if an error has no message", () => {
  const failed = query({ isError: true, error: { status: 503 } });
  const view = fixture("account-ui/AvatarPicker.js", {
    "@tanstack/react-query": { useQuery: () => failed, useQueryClient: () => ({}) },
    "@/contexts/UserContext": user, "@/lib/cache/avatar-queries": { avatarChoicesOptions: () => ({}) },
    "@/lib/cache/account-profile-queries": {}, "next/navigation": { useRouter: () => ({}) },
    "@/components/ui/skeleton": {}, "../ui/Modal": ({ children }) => children,
    "@/lib/server-actions/account-actions": {}, "../../lib/helpers": {},
  });
  view.render(); assert.equal(view.errors.length, 1); assert.equal(view.errors[0].error, failed.error);
  view.errors[0].reset(); assert.equal(failed.retries, 1);
});

test("narrative errors preserve loaded entries and retry the failed page operation", () => {
  for (const scenario of ["initial", "refresh", "next"]) {
    let nextRetries = 0;
    const failed = query({ isError: true, error: new Error("fetch failed"),
      data: scenario === "initial" ? undefined : { pages: [{ narratives: [{ id: "narrative-1" }] }] },
      isFetchNextPageError: scenario === "next", fetchNextPage: () => { nextRetries += 1; } });
    const view = fixture("weekly-narratives-ui/WeeklyNarrativeContent.js", {
      "@tanstack/react-query": { useInfiniteQuery: () => failed, useQueryClient: () => ({}) },
      "@/contexts/UserContext": user,
      "@/components/skeletons/WeeklyNarrativeListSkeleton": () => null,
      "@/lib/see-more-pagination.mjs": {},
      "./WeeklyNarrativeCard": () => "Saved narrative",
      "@/lib/cache/weekly-narratives-queries": { weeklyNarrativesKeys: { list: () => [] }, weeklyNarrativesInfiniteOptions: () => ({}) },
    });
    const html = view.render({ internshipId: "record-1" });
    assert.equal(view.errors.length, 1); assert.ok(!html.includes("No narratives yet"));
    assert.equal(html.includes("Saved narrative"), scenario !== "initial");
    view.errors[0].reset(); assert.equal(nextRetries, scenario === "next" ? 1 : 0);
    assert.equal(failed.retries, scenario === "next" ? 0 : 1);
  }
});

test("ErrorUI keeps status classification and fits embedded failures without a page-height wrapper", () => {
  const view = fixture("ui/ErrorUI.js", {
    "next/navigation": { useRouter: () => ({ refresh: noop }) },
    "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  });
  for (const [error, title] of [
    [{ status: 401 }, "Session Expired"], [{ status: 403 }, "Access Denied"],
    [{ status: 429 }, "Slow Down"], [new Error("fetch failed"), "Connection Problem"],
    [{ status: 500 }, "Server Error"],
  ]) {
    const html = view.render({ error, compact: true, logError: false });
    assert.ok(html.includes(title)); assert.ok(html.includes('role="alert"'));
    assert.ok(!html.includes("min-h-[70vh]")); assert.ok(html.includes("Try Again"));
  }
  assert.ok(view.render({ error: new Error(), logError: false }).includes("min-h-[70vh]"));
});
