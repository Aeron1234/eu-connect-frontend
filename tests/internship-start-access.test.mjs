import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getInternshipStartAccess, manilaCalendarDay } from "../lib/internship-start.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const before = new Date("2026-10-21T15:59:59.999Z");
const midnight = new Date("2026-10-21T16:00:00Z");
const empty = () => null;
const childrenOnly = ({ children }) => children;
const controls = Object.fromEntries(["Select", "SelectContent", "SelectItem", "SelectTrigger", "SelectValue"].map(name => [name, childrenOnly]));

function load(file, mocks = {}, globals = {}) {
  const url = new URL(`../components/${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiledModule = { exports: {} };
  const defaults = {
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "student" } }) },
    "@/components/ui/PageTitle": empty, "@/components/ui/ManualDialog": empty,
    "@/components/ui/ErrorUI": empty, "@/components/ui/ConfirmDialog": empty,
    "@/components/ui/select": controls,
    "@/components/ui/useInternshipStartAccess": (date, feature) => getInternshipStartAccess(date, feature, before),
    "@/components/ui/InternshipStartNotice": ({ message }) => React.createElement("p", { role: "status" }, message),
    "next/link": childrenOnly, ...mocks,
  };
  vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports,
    require(id) { return Object.hasOwn(defaults, id) ? defaults[id] : require(id); }, ...globals });
  return compiledModule.exports.default;
}

function evaluationForm(now = before) {
  return load("evaluations-ui/StudentEvaluationCriteria.js", {
    "./EvaluationPostingGuard": ({ children }) => children,
    "./StudentEvaluationForm": () => React.createElement("button", null, "Submit scores"),
    "./EvaluationsCriteria": () => "Scoring guide",
    "@/components/ui/useInternshipStartAccess": (date, feature) => getInternshipStartAccess(date, feature, now),
  });
}

test("employer evaluation form waits for the Manila start date and fails closed on missing dates", () => {
  const props = { userRole: "employer", searchedUserId: "student", dateStarted: "2026-10-22" };
  const Form = evaluationForm();
  for (const dateStarted of [props.dateStarted, null, "0000-00-00"]) {
    const html = renderToStaticMarkup(React.createElement(Form, { ...props, dateStarted }));
    assert(!html.includes("Submit scores")); assert(!html.includes("Scoring guide"));
    assert(html.includes('role="status"'));
  }
  assert.match(renderToStaticMarkup(React.createElement(Form, props)), /October 22, 2026.*Philippine time/);
  const open = renderToStaticMarkup(React.createElement(evaluationForm(midnight), props));
  assert(open.includes("Submit scores")); assert(open.includes("Scoring guide"));
  assert.equal(renderToStaticMarkup(React.createElement(Form, { ...props, userRole: "student" })), "");
});

test("profile evaluation history remains visible while the employer submission form is locked", () => {
  const Tab = load("search-user-ui/ProfileEvaluationsTab.js", {
    "../evaluations-ui/StudentEvaluationCriteria": evaluationForm(),
    "../evaluations-ui/StudentEvaluationList": () => "Past evaluation scores",
  });
  const html = renderToStaticMarkup(React.createElement(Tab, {
    userRole: "employer", searchedUserId: "student", dateStarted: "2026-10-22", data: {},
  }));
  assert(html.includes("Past evaluation scores")); assert(!html.includes("Submit scores"));
  assert.match(html, /starting October 22, 2026/);
  const staff = renderToStaticMarkup(React.createElement(Tab, { userRole: "admin", data: {} }));
  assert(staff.includes("Past evaluation scores")); assert(!staff.includes('role="status"'));
});

test("the profile manager passes the current internship start date into the evaluation tab", () => {
  let received;
  const Manager = load("search-user-ui/SearchedUserRecordsManager.js", {
    "./SearchedUserFilter": empty, "../weekly-narratives-ui/StudentNarratives": empty,
    "../internship-docs-ui/EmployerCertificateUploads": empty, "./ProfileInfoGrid": empty,
    "../skeletons/TabContentSkeleton": empty, "./ProfileDtrTab": empty,
    "./ProfileEvaluationsTab": props => { received = props; return "Evaluations tab"; },
    "./useSearchedUserTabs": () => ({ hideTabs: false, tabQuery: {}, activeTab: "evaluations", isPending: false, data: {} }),
  });
  renderToStaticMarkup(React.createElement(Manager, {
    userRole: "employer", searchedUserId: "student", info: { internship_date_started: "2026-10-22" },
  }));
  assert.equal(received.dateStarted, "2026-10-22"); assert.equal(received.searchedUserId, "student");
});

test("frontend start access follows the Manila calendar and rejects invalid or missing dates", () => {
  for (const value of ["2026-10-22", "2026-10-21T16:00:00Z", new Date("2026-10-21T16:00:00Z")]) {
    assert.equal(getInternshipStartAccess(value, "Weekly narratives", before).allowed, false);
    assert.equal(getInternshipStartAccess(value, "Weekly narratives", midnight).allowed, true);
  }
  for (const value of [null, "", "bad", "0000-00-00", "2026-02-30"]) {
    assert.equal(manilaCalendarDay(value), null);
    assert.equal(getInternshipStartAccess(value, "Summary reports", midnight).allowed, false);
  }
  assert.match(getInternshipStartAccess("2026-10-22", "Summary reports", before).message, /October 22, 2026.*Philippine time/);
});

function narrativesPage(record, now = before) {
  let actions;
  const Page = load("weekly-narratives-ui/StudentNarrativesPageContent.js", {
    "@tanstack/react-query": { useQuery: ({ queryKey }) => ({ isPending: false, data: queryKey === "past" ? (record.status === "finished" ? [record] : []) : record.status === "ongoing" ? record : null }),
      useInfiniteQuery: () => ({ isPending: false, data: { pages: [{ totalRecords: 1 }] } }) },
    "@/lib/cache/student-storage-queries": { activeStorageRecordOptions: () => ({ queryKey: "active" }), pastStorageRecordsOptions: () => ({ queryKey: "past" }) },
    "@/lib/cache/weekly-narratives-queries": { weeklyNarrativesInfiniteOptions: () => ({}) },
    "@/components/weekly-narratives-ui/WeeklyNarrativeContent": props => { actions = props; return "Saved narrative"; },
    "@/components/weekly-narratives-ui/WeeklyNarrativePostButton": () => React.createElement("button", null, "New Narrative"),
    "@/components/weekly-narratives-ui/WeeklyNarrativesStats": empty,
    "@/components/skeletons/StudentNarrativesPageSkeleton": empty,
    "@/components/skeletons/WeeklyNarrativesStatsSkeleton": empty,
    "@/components/skeletons/WeeklyNarrativeListSkeleton": empty,
    "./WeeklyNarrativesPrintButton": () => React.createElement("button", null, "Export PDF"),
    "@/components/ui/useInternshipStartAccess": (date, feature) => getInternshipStartAccess(date, feature, now),
  });
  return { html: renderToStaticMarkup(React.createElement(Page)), get actions() { return actions; } };
}

test("narratives remain readable and exportable while creation/editing waits for the start date", () => {
  const record = { id: "internship", status: "ongoing", company_name: "Company", date_started: "2026-10-22" };
  const blocked = narrativesPage(record);
  assert(!blocked.html.includes("<button>New Narrative"));
  assert(blocked.html.includes("Saved narrative") && blocked.html.includes("Export PDF"));
  assert.match(blocked.html, /starting October 22, 2026/);
  assert.equal(blocked.actions.canEdit, false); assert.equal(blocked.actions.showActions, true);
  const open = narrativesPage(record, midnight);
  assert(open.html.includes("<button>New Narrative")); assert.equal(open.actions.canEdit, true);
  const past = narrativesPage({ ...record, status: "finished", date_started: "2000-01-01" });
  assert(!past.html.includes("<button>New Narrative")); assert.equal(past.actions.showActions, false);
  assert(past.html.includes("Export PDF"));
});

test("a locked narrative card preserves reading and deleting but has no edit modal", () => {
  const modals = [];
  const Card = load("weekly-narratives-ui/WeeklyNarrativeCard.js", {
    "../ui/Modal": props => { modals.push(props); return props.children; },
    "./WeeklyNarrativeEditForm": empty, "./WeeklyNarrativeDelete": empty,
    "./NarrativePreview": () => "Full saved narrative",
  });
  const html = renderToStaticMarkup(React.createElement(Card, { showActions: true, canEdit: false,
    narrative: { id: 1, title: "Saved", created_at: "2026-10-20", week_number: 1 } }));
  assert(html.includes("Full saved narrative"));
  assert.deepEqual(modals.map(modal => modal.variant), ["confirmation"]);
});

function summaryPage(record, now = before, editing = false) {
  let toolbar, editorCalls = 0;
  const Page = load("summary-reports-ui/StudentSummaryReportsPage.js", {
    "@/components/skeletons/SummaryReportsSkeleton": empty,
    "./SummaryReportContent": () => "Saved summary report",
    "./SummaryReportEditor": () => { editorCalls++; return "Summary editor"; },
    "./SummaryReportsHelp": empty,
    "./SummaryReportsToolbar": props => { toolbar = props; return "Record selector and downloads"; },
    "./useStudentSummaryReports": () => ({ records: [record], record, reports: { isPending: false, data: [record] }, editing, deleteMutation: {} }),
    "@/components/ui/useInternshipStartAccess": (date, feature) => getInternshipStartAccess(date, feature, now),
  });
  return { html: renderToStaticMarkup(React.createElement(Page)), get toolbar() { return toolbar; }, get editorCalls() { return editorCalls; } };
}

test("summary reports block new/edit forms before the date while keeping saved content available", () => {
  const record = { internship_id: "internship", date_started: "2026-10-22", status: "ongoing", company_name: "Company" };
  for (const report_id of [undefined, "report"]) {
    const blocked = summaryPage({ ...record, report_id }, before, true);
    assert.equal(blocked.editorCalls, 0); assert.equal(blocked.toolbar.canEdit, false);
    assert.equal(blocked.toolbar.editing, false);
    assert.match(blocked.html, /starting October 22, 2026/);
    if (report_id) assert(blocked.html.includes("Saved summary report"));
    assert.equal(summaryPage({ ...record, report_id }, midnight, true).editorCalls, 1);
  }
  const finished = summaryPage({ ...record, date_started: "2000-01-01", status: "finished" });
  assert.equal(finished.editorCalls, 1);
});

test("a locked summary toolbar retains its delete and PDF actions", () => {
  const Toolbar = load("summary-reports-ui/SummaryReportsToolbar.js", {
    "./summaryReportFields": { secondaryButton: "button" },
    "./SummaryReportPrintButton": () => React.createElement("button", null, "Export PDF"),
  });
  const record = { internship_id: "internship", report_id: "report", company_name: "Company" };
  const html = renderToStaticMarkup(React.createElement(Toolbar, { record, records: [record], canEdit: false, editing: false }));
  assert(!html.includes(">Edit</button>")); assert(html.includes("Delete</button>")); assert(html.includes("Export PDF"));
});

test("a page left open unlocks at Manila midnight and cleans up its timer and listeners", () => {
  let now = before.getTime(), revision = 0, pending, cleanup, lastDependencies;
  const timers = new Map(), listeners = new Map(); let timerId = 0;
  const Hook = load("ui/useInternshipStartAccess.js", {
    react: { useReducer: () => [revision, () => { revision++; }],
      useEffect(callback, dependencies) {
        if (!lastDependencies || dependencies.some((value, index) => value !== lastDependencies[index])) {
          pending = callback; lastDependencies = dependencies;
        }
      } },
    "@/lib/internship-start.mjs": { getInternshipStartAccess: (date, feature) => getInternshipStartAccess(date, feature, new Date(now)) },
  }, {
    Date: { now: () => now },
    window: { setTimeout(callback, delay) { timers.set(++timerId, { callback, due: now + delay }); return timerId; }, clearTimeout: id => timers.delete(id),
      addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: name => listeners.delete(name) },
    document: { addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: name => listeners.delete(name) },
  });
  function render() {
    const access = Hook("2026-10-22", "Weekly narratives");
    if (pending) { cleanup?.(); cleanup = pending(); pending = null; }
    return access;
  }
  assert.equal(render().allowed, false); assert.equal(timers.size, 1);
  const [id, timer] = timers.entries().next().value;
  assert.equal(timer.due, midnight.getTime() + 25);
  timers.delete(id); now = timer.due; timer.callback();
  assert.equal(revision, 1); assert.equal(render().allowed, true); assert.equal(timers.size, 0);
  cleanup(); assert.equal(listeners.size, 0);
});
