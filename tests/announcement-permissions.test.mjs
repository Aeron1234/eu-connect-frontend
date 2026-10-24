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
const childrenOnly = ({ children }) => children;
function load(file, mocks = {}) {
  const url = new URL(`../${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return compiled.exports;
}

const categories = [{ id: 7, name: "General" }, { id: 9, name: "Department" }];
function renderForm(user, type = "create", data = null) {
  const Form = load("components/announcements-ui/AnnouncementForm.js", {
    "@/contexts/UserContext": { useUser: () => ({ user }) },
    "@/components/ui/ModalForm": { __esModule: true, controlClass: "input", default: {
      Root: childrenOnly, Section: childrenOnly, Row: childrenOnly, Field: childrenOnly,
      Input: props => React.createElement("input", props), Textarea: props => React.createElement("textarea", props), Actions: empty,
    } },
    "@/components/ui/modalFormStyles": {}, "../ui/DeleteForm": empty,
    "@/components/ui/select": Object.fromEntries(["Select", "SelectContent", "SelectGroup", "SelectLabel", "SelectItem", "SelectTrigger", "SelectValue"].map(name => [name, childrenOnly])),
  }).default;
  return renderToStaticMarkup(React.createElement(Form, { categories, type, data }));
}

test("department heads have a fixed Department category for creation and editing", () => {
  const user = { role: "department_head", department_code: "CCS" };
  for (const type of ["create", "edit"]) {
    const html = renderForm(user, type, type === "edit" ? { id: "post", category_id: 9 } : null);
    assert(html.includes("Department")); assert(!html.includes("General"));
    assert.match(html, /name="category_id"[^>]*value="9"/);
  }
  const legacy = renderForm(user, "edit", { id: "legacy", category_id: 7 });
  assert.match(legacy, /name="category_id"[^>]*value="9"/);
  assert(!legacy.includes("General")); // The old General category cannot be resubmitted.
});

test("registrar heads and admins both have a fixed General category", () => {
  const registrar = renderForm({ role: "department_head", department_code: "REG" });
  assert(registrar.includes("General")); assert(!registrar.includes("Department"));
  assert.match(registrar, /name="category_id"[^>]*value="7"/);
  const legacyRegistrar = renderForm({ role: "department_head", department_code: "REG" }, "edit", { id: "old-post", category_id: 9 });
  assert.match(legacyRegistrar, /name="category_id"[^>]*value="7"/);
  assert(!legacyRegistrar.includes("Department"));
  const admin = renderForm({ role: "admin" });
  assert(admin.includes("General")); assert(!admin.includes("Department"));
  assert.match(admin, /name="category_id"[^>]*value="7"/);
});

test("employer navigation, quick actions, dashboard and help have no announcement entry", () => {
  const { getSidebarRouteGroups } = load("components/ui/sidebar/sidebarRoutes.js");
  const routes = role => getSidebarRouteGroups(role, "CCS", `/${role}`).flatMap(group => group.routes);
  assert(!routes("employer").some(route => route.href === "/announcements"));
  assert(!routes("employer").some(route => route.href === "/calendar"));
  for (const role of ["student", "department_head", "admin"]) assert(routes(role).some(route => route.href === "/announcements"));

  const QuickActions = load("components/dashboard-ui/QuickActionsCard.js", {
    "next/link": ({ href, children }) => React.createElement("a", { href }, children),
  }).default;
  const actions = renderToStaticMarkup(React.createElement(QuickActions));
  assert(!actions.includes("/announcements")); assert(!actions.includes("/calendar"));
  let stats;
  const Stats = load("components/dashboard-ui/EmployerDashboardStats.js", {
    "@/components/dashboard-ui/DashboardStats": props => { stats = props.stats; return null; },
  }).default;
  renderToStaticMarkup(React.createElement(Stats, { stats: { unreadAnnouncements: 5 } }));
  assert.equal(stats.length, 3); assert(!stats.some(stat => stat.label.includes("Announcements")));

  const common = load("components/help-ui/guides/commonGuides.js");
  const sharedGuides = load("components/help-ui/guides/sharedGuides.js", { "./commonGuides": common }).default;
  const employerGuides = load("components/help-ui/guides/employerGuides.js", { "./commonGuides": common }).default;
  const helpContent = load("components/help-ui/helpContent.js", {
    "./guides/studentGuides": [], "./guides/employerGuides": employerGuides,
    "./guides/departmentHeadGuides": [], "./guides/adminGuides": [], "./guides/sharedGuides": sharedGuides,
  });
  const useGuides = load("components/help-ui/useHelpGuides.js", {
    react: { useMemo: callback => callback(), useState: initial => [initial, () => {}] },
    "@/contexts/UserContext": { useUser: () => ({ user: { role: "employer" } }) },
    "./helpContent": helpContent,
  }).default;
  assert(!useGuides().visibleSections.flatMap(section => section.guides).some(guide => guide.href === "/announcements"));
});

test("direct navigation to the announcement page redirects employers to their dashboard", async () => {
  const Layout = load("app/announcements/layout.js", {
    "next/navigation": { redirect: path => { throw new Error(`Redirect:${path}`); } },
    "../../lib/server-actions/auth": { getUserSession: async () => ({ user: { role: "employer" } }) },
    "../../components/ui/Header": empty, "@/components/ui/StickyHeaderSurface": empty,
    "../../components/ui/SideNavigation": empty, "../../components/ui/Alert": empty,
    "../../components/ui/SocketProvider": empty, "@/contexts/UserContext": { UserProvider: empty },
  }).default;
  await assert.rejects(() => Layout({ children: null }), /Redirect:\/employer/);
});

test("employer calendar hides announcement filters and entries even with an old cached month", () => {
  const kinds = load("components/calendar-ui/calendarKinds.js");
  const dateUtils = load("components/calendar-ui/calendarDateUtils.js");
  const oldMonth = { announcements: [{ id: "old", kind: "announcement" }], schedules: [{ id: "schedule", kind: "schedule" }], internship: null, todos: [] };
  const useBoard = load("components/calendar-ui/useCalendarBoard.js", {
    react: { useEffect() {}, useMemo: callback => callback(), useRef: initial => ({ current: initial }), useState: initial => [typeof initial === "function" ? initial() : initial, () => {}] },
    "@tanstack/react-query": { useQuery: () => ({ data: oldMonth }), useQueryClient: () => ({}) },
    "sonner": { toast: {} }, "@/contexts/UserContext": { useUser: () => ({ user: { id: "employer", role: "employer" } }) },
    "@/components/ui/SocketProvider": {}, "@/lib/cache/calendar-queries": { calendarMonthOptions: () => ({}), isCalendarMonth: () => true },
    "@/lib/server-actions/calendar-actions": {}, "./calendarKinds": kinds, "./calendarDateUtils": dateUtils,
    "./calendarEntries": { entriesFor: data => [...data.announcements, ...data.schedules] },
  }).default;
  const state = useBoard({ initialDate: "2026-10-21", initialData: oldMonth });
  assert.deepEqual(Array.from(state.monthProps.activeKinds, kind => kind.id), ["schedule"]);
  assert.deepEqual(Array.from(state.agendaProps.entries, entry => entry.id), ["schedule"]);
});
