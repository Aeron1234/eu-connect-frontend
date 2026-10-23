import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { hasValidPage } from "../lib/see-more-pagination.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks, globals = {}) {
  const url = new URL("../" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, ...globals, require(id) {
    return Object.hasOwn(mocks, id) ? mocks[id] : require(id);
  } });
  return mod.exports;
}

test("department selection has independent cache pages and reaches every paginated read", async () => {
  const requests = [];
  const queries = load("lib/cache/past-internships-queries.js", {
    "@tanstack/react-query": { infiniteQueryOptions: options => options },
    "@/lib/server-actions/past-internships-actions": { async getAlumniInternshipsResult(filters) {
      requests.push(filters); return { data: [], pagination: { page: filters.page, totalPages: 3 } };
    } },
    "@/lib/see-more-pagination.mjs": { hasValidPage },
  });
  const filters = { academicYear: "2025-2026", search: "Graduate" };
  const all = queries.pastInternshipsInfiniteOptions("staff", filters);
  const selected = queries.pastInternshipsInfiniteOptions("staff", { ...filters, departmentId: "2" });
  assert.notDeepEqual(all.queryKey, selected.queryKey);
  assert.equal(selected.initialPageParam, 1);
  await selected.queryFn({ pageParam: 1 });
  const second = await selected.queryFn({ pageParam: 2 });
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.departmentId, "2"); assert.equal(request.academicYear, filters.academicYear); assert.equal(request.search, filters.search);
  }
  assert.equal(selected.getNextPageParam(second), 3);
  assert.deepEqual(queries.pastInternshipsKeys.list("staff", filters), queries.pastInternshipsKeys.list("staff", { ...filters, departmentId: "all" }));
});

test("the authenticated read forwards department, year, search and page without changing all-department requests", async () => {
  const urls = [];
  const actions = load("lib/server-actions/past-internships-actions.js", {
    "../api-base-url.mjs": { getApiBaseUrl: () => "https://example.test/api/v1" },
    "next/cache": { revalidatePath() {} }, "./auth": { getAccessToken: async () => "test-token" },
    "../api-response": {},
  }, { URLSearchParams, fetch: async (url, options) => {
    urls.push(new URL(url)); assert.equal(options.headers.Authorization, "Bearer test-token");
    return { ok: true, json: async () => ({ data: [] }) };
  } });
  await actions.getAlumniInternships({ departmentId: "2", academicYear: "2025-2026", search: "Graduate & Company", page: 2 });
  assert.equal(urls[0].searchParams.get("departmentId"), "2");
  assert.equal(urls[0].searchParams.get("academicYear"), "2025-2026");
  assert.equal(urls[0].searchParams.get("search"), "Graduate & Company");
  assert.equal(urls[0].searchParams.get("page"), "2");
  await actions.getAlumniInternships({ departmentId: "all" });
  assert.equal(urls[1].searchParams.has("departmentId"), false);
});

function nodes(tree) { return !tree?.props ? [] : [tree, ...React.Children.toArray(tree.props.children).flatMap(nodes)]; }

test("department acronyms share a mobile row with academic year and preserve combined filters and cached results", () => {
  const state = [], refs = [], effects = [], scheduled = [], observed = [];
  const cached = new Map();
  let cursor = 0, refCursor = 0;
  const Dropdown = () => null, Search = () => null, Year = () => null;
  const data = { pages: [{ data: [{ company_name: "Company" }], academicYears: ["2025-2026"], departments: [
    { id: 1, name: "Computing", code: "CCS" }, { id: 2, name: "Business", code: "CBA" },
  ] }] };
  const key = filters => ["past", filters.academicYear, filters.search, filters.departmentId];
  const Page = load("components/past-internship-ui/PastInternshipsPageContent.js", {
    react: { ...React, useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }]; },
      useRef(initial) { return refs[refCursor++] ||= { current: initial }; }, useMemo: calculate => calculate(), useEffect: effect => effects.push(effect) },
    "@tanstack/react-query": { useQuery: () => ({ data: [] }), useQueryClient: () => ({ getQueryData: value => cached.get(JSON.stringify(value)) }),
      useInfiniteQuery: options => { observed.push(options.queryKey); return { data, isPending: false, hasNextPage: true }; } },
    "@/lib/cache/reference-queries": { coursesOptions: () => ({}) },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "staff" } }) },
    "@/lib/see-more-pagination.mjs": {},
    "@/lib/cache/past-internships-queries": { pastInternshipsInfiniteOptions: (_user, filters) => ({ queryKey: key(filters) }), pastInternshipsKeys: { list: (_user, filters) => key(filters) } },
    "@/lib/client-read-error": {}, "@/components/ui/ErrorUI": () => null,
    "../ui/SearchBar": Search, "./AlumniCompanies": () => null, "../ui/AcademicYearFilter": Year,
    "../ui/DropdownFilter": Dropdown, "../skeletons/AlumniCompaniesSkeleton": () => null,
  }, { setTimeout: callback => { scheduled.push(callback); return scheduled.length; }, clearTimeout() {} }).default;
  function render() {
    cursor = 0; refCursor = 0; effects.length = 0;
    const tree = nodes(Page({}));
    for (const effect of effects) effect();
    return tree;
  }
  function flush() { const callback = scheduled.at(-1); scheduled.length = 0; callback(); return render(); }
  let tree = render();
  const dropdown = () => tree.find(node => node.type === Dropdown);
  assert(dropdown().props.className.split(" ").includes("w-full"));
  const row = tree.find(node => node.type === "div" &&
    React.Children.toArray(node.props.children).some(child => child?.type === Year) &&
    React.Children.toArray(node.props.children).some(child => child?.type === Dropdown));
  assert(row.props.className.split(" ").includes("grid-cols-2"));
  assert.equal(tree.find(node => node.type === Year).props.className, dropdown().props.className);
  assert.deepEqual(JSON.parse(JSON.stringify(dropdown().props.options.map(option => option.label))), ["Departments", "CCS", "CBA"]);
  assert.deepEqual(JSON.parse(JSON.stringify(dropdown().props.options.map(option => option.value))), ["all", "1", "2"]);
  dropdown().props.onValueChange("2"); tree = render(); tree = flush();
  assert.deepEqual(JSON.parse(JSON.stringify(observed.at(-1))), ["past", "all", "", "2"]);
  tree.find(node => node.type === Search).props.onChange({ target: { value: "  Graduate  " } }); tree = render(); tree = flush();
  tree.find(node => node.type === Year).props.onChange("2025-2026"); tree = render(); tree = flush();
  assert.deepEqual(JSON.parse(JSON.stringify(observed.at(-1))), ["past", "2025-2026", "Graduate", "2"]);
  cached.set(JSON.stringify(["past", "2025-2026", "Graduate", "all"]), { pages: [{}] });
  dropdown().props.onValueChange("all"); tree = render();
  assert.deepEqual(JSON.parse(JSON.stringify(observed.at(-1))), ["past", "2025-2026", "Graduate", "all"]);
  assert.equal(scheduled.length, 0);
});
