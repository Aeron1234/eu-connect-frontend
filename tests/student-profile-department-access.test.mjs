import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
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
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, setTimeout, clearTimeout,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); },
  });
  return compiled.exports;
}
const { buildTabs } = load("components/search-user-ui/profileTabs.js");
const base = { userRole: "department_head", searchedUserRole: "student", hasOngoingInternship: true };

test("department heads need explicit current department permission for student work tabs", () => {
  for (const value of [undefined, false, null]) assert.deepEqual(Array.from(buildTabs({ ...base, canViewStudentRecords: value }), tab => tab.value), ["info"]);
  assert.deepEqual(Array.from(buildTabs({ ...base, canViewStudentRecords: true }), tab => tab.value), ["dtr", "narratives", "evaluations", "info"]);
});

test("existing admin, supervisor, student and non-student profile tabs stay unchanged", () => {
  const values = options => Array.from(buildTabs(options), tab => tab.value);
  assert.deepEqual(values({ ...base, userRole: "admin" }), ["dtr", "narratives", "evaluations", "info"]);
  assert.deepEqual(values({ ...base, userRole: "employer", supervision: { status: "accepted" } }), ["dtr", "narratives", "evaluations", "certificates", "info"]);
  assert.deepEqual(values({ ...base, userRole: "employer", supervision: { status: "pending" } }), ["info"]);
  assert.deepEqual(values({ ...base, userRole: "student" }), ["info"]);
  assert.deepEqual(values({ ...base, searchedUserRole: "employer" }), ["info"]);
  assert.deepEqual(values({ ...base, canViewStudentRecords: true, hasOngoingInternship: false }), ["info"]);
});

test("cross-department page requests never preload DTR even with a private tab deep link", async () => {
  for (const [role, allowed] of [["department_head", false], ["department_head", undefined], ["department_head", true], ["admin", undefined]]) {
    let loads = 0;
    const page = load("app/users/[userId]/page.js", {
      "@/lib/page-read-error": { withReadErrorPage: fn => fn },
      "@/components/search-user-ui/SearchedUserHeader": () => null,
      "@/components/search-user-ui/SearchedUserRecordsManager": () => null,
      "@/lib/server-actions/dtr-actions": { getSearchedStudentDTRs: async () => { loads++; return { dtrs: [] }; }, getSearchedStudentDtrLocation: async () => null },
      "@/lib/server-actions/account-actions": { getSearchedUserProfile: async () => ({ user: { header: { role: "student" }, info: {}, hasOngoingInternship: true, permissions: { canViewStudentRecords: allowed } } }) },
      "@/lib/server-actions/auth": { getUserSession: async () => ({ user: { id: "viewer", role, department_code: "REG" } }) },
      "next/navigation": { notFound: () => { throw Error("not found"); } },
    }).default;
    const element = await page({ params: { userId: "student" }, searchParams: { tab: "dtr" } });
    const props = element.props.children[1].props;
    const restricted = role === "department_head" && allowed !== true;
    assert.equal(props.defaultFilter, restricted ? "info" : "dtr");
    assert.equal(loads, restricted ? 0 : 1);
    assert.equal(props.initialDtrData === null, restricted);
  }
});

test("revoked profile permission immediately clamps to Info and removes only that profile's private cache", async () => {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://app.test/users/student" });
  const old = { window: globalThis.window, document: globalThis.document, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  const all = (viewer, student) => ["user-profile", String(viewer), String(student)];
  const tab = (viewer, student, name, page = 1) => [...all(viewer, student), name, ...(name === "dtr" ? [page] : [])];
  const privateKeys = [tab("head", "student", "dtr"), tab("head", "student", "evaluations"), [...all("head", "student"), "narrative-pages"]];
  const retained = [tab("other-head", "student", "dtr"), tab("head", "other-student", "dtr")];
  for (const key of [...privateKeys, ...retained]) client.setQueryData(key, { private: true });
  let snapshot, options;
  const hook = load("components/search-user-ui/useSearchedUserTabs.js", {
    "@tanstack/react-query": { useQueryClient: () => client, useQuery: opts => { options = opts; return { data: client.getQueryData(opts.queryKey), isPending: false }; } },
    "@/lib/client-read-error": { notifyReadError() {} },
    "@/lib/cache/evaluations-queries": { evaluationsKeys: { all: id => ["evaluations", id] } },
    "@/lib/cache/user-profile-queries": { userProfileKeys: { all, tab, dtrPages: (v,s) => [...all(v,s),"dtr"] }, userProfileTabOptions: (v,s,t,p) => ({ queryKey: tab(v,s,t,p) }) },
    "./profileTabs": { buildTabs },
  }).default;
  function Harness({ allowed }) {
    snapshot = hook({ ...base, userId: "head", searchedUserId: "student", canViewStudentRecords: allowed, defaultFilter: "dtr", initialDtrData: { dtrs: [{ id: 99 }] } });
    return React.createElement("p", null, snapshot.activeTab);
  }
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(Harness, { allowed: true })));
    assert.equal(snapshot.activeTab, "dtr"); assert.equal(options.enabled, true);
    await act(async () => root.render(React.createElement(Harness, { allowed: false })));
    assert.equal(snapshot.activeTab, "info"); assert.equal(snapshot.selectedTab, "info");
    assert.equal(options.enabled, false); assert.equal(options.initialData, undefined);
    assert.equal(snapshot.data, undefined);
    for (const key of privateKeys) assert.equal(client.getQueryData(key), undefined);
    for (const key of retained) assert.equal(client.getQueryData(key).private, true);
    await act(async () => snapshot.handleTabClick("evaluations"));
    assert.equal(snapshot.activeTab, "info"); assert.equal(options.enabled, false);
  } finally {
    await act(async () => root.unmount()); client.clear(); dom.window.close();
    globalThis.window = old.window; globalThis.document = old.document; globalThis.IS_REACT_ACT_ENVIRONMENT = old.act;
  }
});
