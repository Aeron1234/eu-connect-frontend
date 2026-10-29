import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const empty = () => null;
const hooks = { ...React, useEffect() {}, useRef: initial => ({ current: initial }), useState: initial => [typeof initial === "function" ? initial() : initial, () => {}] };
function load(file, mocks = {}) {
  const url = new URL(`../${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return compiled.exports;
}

test("employers retain the header month popup but have no full-calendar link", () => {
  for (const role of ["employer", "student", "department_head"]) {
    let index = 0;
    const Header = load("components/ui/HeaderCalendarButton.js", {
      react: { ...hooks, useState: initial => [index++ === 0 ? true : typeof initial === "function" ? initial() : initial, () => {}] },
      "@/contexts/UserContext": { useUser: () => ({ user: { role } }) },
      "next/link": ({ href, children }) => React.createElement("a", { href }, children),
      "@/components/ui/calendar": { Calendar: () => "Simple month calendar" },
    }).default;
    const html = renderToStaticMarkup(React.createElement(Header));
    assert(html.includes('aria-label="Open calendar"')); assert(html.includes("Simple month calendar"));
    assert.equal(html.includes('href="/calendar"'), role !== "employer");
  }
});

test("the full calendar page redirects employer requests", async () => {
  const Layout = load("app/calendar/layout.js", {
    "next/navigation": { redirect(path) { throw Error(`Redirect:${path}`); } },
    "@/lib/server-actions/auth": { getUserSession: async () => ({ user: { role: "employer" } }) },
    "@/components/ui/Header": empty, "@/components/ui/StickyHeaderSurface": empty, "@/components/ui/SideNavigation": empty,
    "@/components/ui/Alert": empty, "@/components/ui/SocketProvider": empty, "@/contexts/UserContext": { UserProvider: empty },
  }).default;
  await assert.rejects(() => Layout({}), /Redirect:\/employer/);
});

test("student evaluation tabs contain only their supervisor form and own submitted history", () => {
  const Hook = load("components/evaluations-ui/useEvaluationsManager.js", {
    react: hooks, "@tanstack/react-query": { useQuery: () => ({}), useQueryClient: () => ({}) },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "student" } }) },
    "@/lib/client-read-error": {}, "@/lib/cache/evaluations-queries": { evaluationsTabOptions: () => ({}) },
  }).default;
  assert.deepEqual(Array.from(Hook([]).tabs, tab => tab.value), ["evaluate-supervisor", "past-evaluations"]);
});

test("student cards never render a cached employer performance evaluation", () => {
  const evaluations = [{ id: "private", type: "Performance Evaluation", comments: "PRIVATE SCORES" },
    { id: "own", type: "Supervisor Evaluation", comments: "Own submitted feedback" }];
  const Card = load("components/evaluations-ui/EvaluationCard.js", {
    "./useEvaluationItems": () => ({ items: evaluations }), "@/contexts/UserContext": { useUser: () => ({ user: { role: "student" } }) },
    "./PostedEvaluationItem": ({ ev }) => ev.comments, "./EvaluationEmptyState": empty,
  }).default;
  const html = renderToStaticMarkup(React.createElement(Card, { evaluations }));
  assert(!html.includes("PRIVATE SCORES")); assert(html.includes("Own submitted feedback"));
});

test("performance PDF actions are available to the submitting employer and staff, never students or other employers", () => {
  for (const [role, id, allowed] of [["student", "student", false], ["employer", "author", true], ["employer", "other", false], ["department_head", "head", true]]) {
    const Hook = load("components/evaluations-ui/usePostedEvaluation.js", {
      react: { ...hooks, useTransition: () => [false, () => {}] },
      "@/contexts/UserContext": { useUser: () => ({ user: { role, id } }) },
      "@/lib/server-actions/evaluations-actions": {}, "@/lib/helpers": {},
    }).default;
    assert.equal(Hook({ ev: { type: "Performance Evaluation", evaluator_id: "author", breakdown: [] } }).canPrint, allowed);
  }
});

test("opening an evaluation notification refreshes that record's evaluations tab", () => {
  const { invalidateNotificationTarget } = load("components/notifications-ui/notificationActions.js", {
    sonner: {}, "@/lib/server-actions/notifications-actions": {}, "@/lib/cache/user-profile-queries": {},
    "@/lib/cache/student-records-queries": {},
  });
  const calls = [];
  invalidateNotificationTarget({ invalidateQueries: options => calls.push(options.queryKey) }, "head", { type: "evaluation_submitted", link: "record" });
  assert.deepEqual(Array.from(calls[0]), ["internship-records", "head", "detail", "record", "evaluations"]);
});
