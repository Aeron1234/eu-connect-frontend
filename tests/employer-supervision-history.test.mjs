import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { hasValidPage } from "../lib/see-more-pagination.mjs";
import * as apiResponse from "../lib/api-response.js";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const empty = () => null;
const e = React.createElement;
const Link = ({ children, ...props }) => e("a", props, children);
function load(file, mocks = {}, globals = {}) {
  const url = new URL("../" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, AbortSignal,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); }, ...globals });
  return compiled.exports;
}
const data = { success: true, interns: [{ student_id: "student/one", first_name: "Anna", last_name: "Cruz", course_name: "BS Computer Science", placements: [
  { internship_id: "second-record", status: "ongoing", company_name: "Company", internship_position: "Developer intern", date_started: "2026-08-01", date_ended: "2026-10-01" },
  { internship_id: "first-record", status: "finished", company_name: "Company", internship_position: "Support intern", date_started: "2026-05-01", date_ended: "2026-07-01" },
], email: "private@example.test", accumulated_hours: 123 }], pagination: { page: 1, pageSize: 5, total: 6, totalPages: 2 } };
function card(result) {
  const Card = load("components/search-user-ui/EmployerSupervisionHistory.js", {
    "@tanstack/react-query": { useQuery: () => result }, "next/link": Link,
    "@/lib/cache/employer-supervision-history-queries": { employerSupervisionHistoryOptions: () => ({}) },
    "@/components/ui/ErrorUI": ({ error }) => e("div", { role: "alert" }, error.message),
    "@/components/skeletons/EmployerSupervisionHistorySkeleton": () => e("div", { role: "status" }, "Loading supervised interns"),
  }).default;
  return renderToStaticMarkup(e(Card, { employerId: "employer", viewerId: "viewer" }));
}

test("history card shows completed placements and profile links without exposing contact or attendance data", () => {
  const dom = new JSDOM(card({ data, isPending: false, isError: false, isFetching: false }));
  try {
    const doc = dom.window.document;
    assert.match(doc.body.textContent, /Anna Cruz|Completed|BS Computer Science/); assert.match(doc.body.textContent, /Aug 1, 2026/);
    assert.equal(doc.querySelector("a").getAttribute("href"), "/users/student%2Fone");
    assert.equal(doc.querySelectorAll("a").length, 1);
    const positions = doc.querySelector('ul[aria-label="Internship positions of Anna Cruz"]');
    assert.equal(positions.children.length, 2);
    assert.match(positions.textContent, /Ongoing/); assert.match(positions.textContent, /Completed/); assert.match(positions.textContent, /Developer intern/); assert.match(positions.textContent, /Support intern/);
    assert.match(positions.textContent, /May 1, 2026/); assert.match(doc.body.textContent, /6 students/);
    assert(!doc.body.textContent.includes("private@example.test")); assert(!doc.body.textContent.includes("123"));
    assert.equal(doc.querySelector('button[aria-label="Previous supervised interns page"]').disabled, true);
    assert.equal(doc.querySelector('button[aria-label="Next supervised interns page"]').disabled, false);
  } finally { dom.window.close(); }
});

test("empty history hides the card while loading and errors have distinct states", () => {
  assert.equal(card({ data: { ...data, interns: [], pagination: { page: 1, total: 0, totalPages: 1 } }, isError: false }), "");
  assert.match(card({ isPending: true }), /Loading supervised interns/);
  assert.match(card({ isPending: false, isError: true, error: new Error("History unavailable") }), /History unavailable/);
  const transient = card({ data, isError: true, error: Object.assign(new Error("Refresh failed"), { status: 503 }) });
  assert.match(transient, /Anna Cruz/); assert.match(transient, /Refresh failed/);
  for (const status of [401, 403, 404]) assert(!card({ data, isError: true, error: Object.assign(new Error("Access unavailable"), { status }) }).includes("Anna Cruz"));
});

test("employer Info places the history below the information card for every role and keeps other target profiles unchanged", () => {
  const Manager = load("components/search-user-ui/SearchedUserRecordsManager.js", {
    "../internship-records-ui/CompanyRotations": empty, "./SearchedUserFilter": empty,
    "./ProfileInfoGrid": () => e("div", { "data-info": true }, "Existing information"),
    "./EmployerSupervisionHistory": () => e("section", { "data-history": true }, "Completed history"),
    "./useSearchedUserTabs": () => ({ activeTab: "info", selectedTab: "info", tabQuery: {}, isPending: false }),
    "@/components/ui/ErrorUI": empty, "../weekly-narratives-ui/StudentNarratives": empty,
    "../internship-docs-ui/EmployerCertificateUploads": empty, "../skeletons/TabContentSkeleton": empty,
    "./ProfileDtrTab": empty, "./ProfileEvaluationsTab": empty,
  }).default;
  for (const userRole of ["student", "employer", "department_head", "admin"]) {
    const dom = new JSDOM(renderToStaticMarkup(e(Manager, { searchedUserId: "employer", userId: "viewer", userRole, searchedUserRole: "employer" })));
    try {
      const info = dom.window.document.querySelector("[data-info]"), history = dom.window.document.querySelector("[data-history]");
      assert(history, userRole); assert.equal(info.parentElement.contains(history), false); assert.equal(info.parentElement.nextElementSibling, history);
    } finally { dom.window.close(); }
    assert(!renderToStaticMarkup(e(Manager, { userRole, searchedUserRole: "student" })).includes("Completed history"));
  }
});

test("history queries separate viewers, employers and pages and reject failed or malformed reads", async () => {
  let result = data;
  const { employerSupervisionHistoryOptions: options } = load("lib/cache/employer-supervision-history-queries.js", {
    "@tanstack/react-query": { queryOptions: value => value },
    "../server-actions/employer-supervision-history-actions": { getEmployerSupervisionHistory: async () => result },
    "../see-more-pagination.mjs": { hasValidPage },
  });
  const keys = [options("viewer", "employer", 1), options("other", "employer", 1), options("viewer", "other", 1), options("viewer", "employer", 2)].map(option => JSON.stringify(option.queryKey));
  assert.equal(new Set(keys).size, 4); assert.equal(options("viewer", "employer", 1).refetchOnMount, "always");
  assert.equal(await options("viewer", "employer", 1).queryFn(), data);
  for (const failure of [{ error: "Session expired", status: 401 }, { interns: [] }, { success: true, interns: "bad", pagination: data.pagination }, { ...data, interns: [{ student_id: "legacy-flat-record" }] }]) {
    result = failure; await assert.rejects(options("viewer", "employer", 1).queryFn());
  }
});

test("history action requires authentication, encodes the target and preserves HTTP errors without making live requests", async () => {
  let token = null, request; let response = Response.json(data);
  const { getEmployerSupervisionHistory: read } = load("lib/server-actions/employer-supervision-history-actions.js", {
    "../api-base-url.mjs": { getApiBaseUrl: () => "https://backend.example.test/api/v1" },
    "../api-response": apiResponse, "./auth": { getAccessToken: async () => token },
  }, { fetch: async (url, options) => { request = { url, options }; return response; } });
  assert.equal((await read("employer")).status, 401); assert.equal(request, undefined);
  token = "test-token"; assert.equal((await read("employer/one", 2)).success, true);
  assert.equal(request.url, "https://backend.example.test/api/v1/searched-user/employer%2Fone/supervised-interns?page=2");
  assert.equal(request.options.cache, "no-store"); assert.equal(request.options.headers.Authorization, "Bearer test-token"); assert.ok(request.options.signal);
  request = undefined; assert.equal((await read("employer", 0)).status, 400); assert.equal(request, undefined);
  response = Response.json({ error: "Employer profile not found." }, { status: 404 });
  assert.equal((await read("missing")).status, 404);
});
