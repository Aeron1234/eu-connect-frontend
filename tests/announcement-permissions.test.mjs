import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from 'jsdom';

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
test('student tag picker restores named selections and serializes them without changing employer opt-in', () => {
  const id='00000000-0000-4000-8000-000000000001';
  const second='00000000-0000-4000-8000-000000000002';
  const Tags=load('components/announcements-ui/AnnouncementStudentTags.js', {
    '@/contexts/UserContext':{useUser:()=>({user:{id:'author',role:'admin'}})},
    '@tanstack/react-query':{useQuery:()=>({data:[{id,first_name:'Tagged',last_name:'Student'},{id:second,first_name:'Second',last_name:'Student'}],isFetching:false,isError:false})},
    '@/lib/server-actions/announcements-actions':{},
    '@/components/ui/checkbox':{Checkbox:({checked,disabled})=>React.createElement('input',{type:'checkbox',checked,disabled,readOnly:true})},
    '@/components/ui/skeleton':{Skeleton:empty},
  }).default;
  const dom=new JSDOM(renderToStaticMarkup(React.createElement(Tags,{initialIds:JSON.stringify([id,second]),initialStudents:JSON.stringify([{id,name:'Tagged Student'},{id:second,name:'Second Student'}]),disabled:false})));
  try {
    assert.deepEqual(JSON.parse(dom.window.document.querySelector('input[name="tagged_student_ids"]').value),[id,second]);
    assert.match(dom.window.document.querySelector('button').textContent,/Tagged Student/);
    assert.equal(dom.window.document.querySelector('input[type="checkbox"]').checked,true);
    assert.equal(dom.window.document.querySelectorAll('input[type="checkbox"]:checked').length,2);
    assert.match(dom.window.document.body.textContent,/Select multiple ongoing students from any department/);
    assert.match(dom.window.document.body.textContent,/only tagged students/);
    assert.equal(dom.window.document.querySelector('[name="visible_to_employers"]'),null);
  } finally {dom.window.close();}
});
function renderForm(user, type = "create", data = null) {
  const Form = load("components/announcements-ui/AnnouncementForm.js", {
    './AnnouncementStudentTags': empty,
    '@/components/ui/DropdownFilter': empty,
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

test('announcement audience defaults broad and restores targeted mode on edit', () => {
  const user={id:'admin',role:'admin'};
  for(const [type,data,value] of [['create',null,'0'],['edit',{id:'post',tagged_students_only:1,tagged_student_ids:[],title:'Private',content:'Body'},'1']]) {
    const dom=new JSDOM(renderForm(user,type,data));
    try {
      assert.equal(dom.window.document.querySelector('[name="tagged_students_only"]').value,value);
      if(value==='1') assert.match(dom.window.document.body.textContent,/admins retain access without an automatic alert/);
    } finally {dom.window.close();}
  }
});

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

test("employer visibility is opt-in on creation and restores saved checkbox state during editing", () => {
  const user = { role: "admin" };
  assert.match(renderForm(user), /type="hidden" name="visible_to_employers" value="0"/);
  const createCheckbox = renderForm(user).match(/<input type="checkbox"[^>]*>/)[0];
  assert(!createCheckbox.includes("checked"));
  const editCheckbox = renderForm(user, "edit", { id: "shared", visible_to_employers: 1 }).match(/<input type="checkbox"[^>]*>/)[0];
  assert(editCheckbox.includes('checked=""'));
});

test("Department announcement cards and expanded posts label the author's department only for employers/admins", () => {
  for (const role of ["employer", "admin", "student", "department_head"]) {
    const Card = load("components/announcements-ui/AnnouncementCard.js", {
      react: { ...React, useEffect() {}, useRef: () => ({ current: null }), useState: () => [true, () => {}] },
      "@/contexts/UserContext": { useUser: () => ({ user: { id: "viewer", role } }) },
      "@/lib/announcement-event-dates.mjs": {},
      "../ui/Modal": childrenOnly, "./AnnouncementTogglePin": empty, "./AnnouncementUpdate": empty, "./AnnouncementDelete": empty,
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    }).default;
    const announcement = { id: "post", author_id: "author", category: "Department", title: "Department notice", content: "Long content", created_at: "2026-10-30", role: "department_head", author_department_name: "College of Computer Studies", author_department_code: "CCS" };
    for (const is_pinned of [0, 1]) {
      const html = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, is_pinned } }));
      assert.equal((html.match(/Department: College of Computer Studies \(CCS\)/g) || []).length, ["employer", "admin"].includes(role) ? 2 : 0);
    }
    const general = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, category: "General" } }));
    assert(!general.includes("Department: College"));
    if (["employer", "admin"].includes(role)) {
      const missing = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, author_department_name: null, author_department_code: null } }));
      assert(missing.includes("Department: -"));
    }
  }
});

test("announcement cards show tagged names from the feed's JSON metadata", () => {
  const Card = load("components/announcements-ui/AnnouncementCard.js", {
    react: { ...React, useEffect() {}, useRef: () => ({ current: null }), useState: (initial) => [initial, () => {}] },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "viewer", role: "student" } }) },
    "@/lib/announcement-event-dates.mjs": {},
    "../ui/Modal": childrenOnly, "./AnnouncementTogglePin": empty, "./AnnouncementUpdate": empty, "./AnnouncementDelete": empty,
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
  }).default;
  const announcement = { id: "post", author_id: "author", category: "General", title: "Notice", content: "Body", created_at: "2026-10-30", role: "admin" };
  const students = ["Ana Cruz", "Ben Santos", "Cara Reyes", "Dan Lopez"].map((name, index) => ({ id: String(index), name }));
  const targeted = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, tagged_students_only: 1, visible_to_employers: 0 } }));
  assert.match(targeted, />Tagged students<\/span>/);
  const sharedWithSupervisors = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, tagged_students_only: 1, visible_to_employers: 1 } }));
  assert.match(sharedWithSupervisors, />Tagged students \+ Supervisor<\/span>/);
  const html = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, tagged_students: JSON.stringify(students) } }));
  for (const [index, student] of students.entries()) {
    assert.equal(html.includes(`href="/users/${student.id}"`), index < 3);
  }
  assert.match(html, /hover:underline/);
  assert.match(html, /Ana Cruz/);
  assert.match(html, /Ben Santos/);
  assert.match(html, /Cara Reyes/);
  assert.match(html, /Show all 4/);
  assert(!html.includes("Dan Lopez"));

  const single = renderToStaticMarkup(React.createElement(Card, { announcement: { ...announcement, tagged_students: [students[0]] } }));
  assert.match(single, /Tagged students:.*Ana Cruz/);
  assert(!single.includes("Show all"));
  const untagged = renderToStaticMarkup(React.createElement(Card, { announcement }));
  assert(!untagged.includes("Tagged students:"));
});

test("employer navigation and Help allow shared announcements while Calendar stays restricted", () => {
  const { getSidebarRouteGroups } = load("components/ui/sidebar/sidebarRoutes.js");
  const routes = role => getSidebarRouteGroups(role, "CCS", `/${role}`).flatMap(group => group.routes);
  assert(routes("employer").some(route => route.href === "/announcements"));
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
  const employerGuides = load("components/help-ui/guides/employerGuides.js", { "./commonGuides": common, "./bulkDtrGuide": load('components/help-ui/guides/bulkDtrGuide.js') }).default;
  const helpContent = load("components/help-ui/helpContent.js", {
    "./guides/studentGuides": [], "./guides/employerGuides": employerGuides,
    "./guides/departmentHeadGuides": [], "./guides/adminGuides": [], "./guides/sharedGuides": sharedGuides,
  });
  const useGuides = load("components/help-ui/useHelpGuides.js", {
    react: { useMemo: callback => callback(), useState: initial => [initial, () => {}] },
    "@/contexts/UserContext": { useUser: () => ({ user: { role: "employer" } }) },
    "./helpContent": helpContent,
  }).default;
  assert(useGuides().visibleSections.flatMap(section => section.guides).some(guide => guide.href === "/announcements"));
});

test("direct navigation to the announcement page allows signed-in employers", async () => {
  const Layout = load("app/announcements/layout.js", {
    "next/navigation": { redirect: path => { throw new Error(`Redirect:${path}`); } },
    "../../lib/server-actions/auth": { getUserSession: async () => ({ user: { role: "employer" } }) },
    "../../components/ui/Header": empty, "@/components/ui/StickyHeaderSurface": empty,
    "../../components/ui/SideNavigation": empty, "../../components/ui/Alert": empty,
    "../../components/ui/SocketProvider": empty, "@/contexts/UserContext": { UserProvider: empty },
  }).default;
  assert.ok(await Layout({ children: null }));
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
