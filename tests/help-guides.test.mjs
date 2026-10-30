import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const root = fileURLToPath(new URL("../", import.meta.url));
function loader(mocks = {}) {
  const modules = new Map();
  function load(file) {
    const path = resolve(root, file);
    if (modules.has(path)) return modules.get(path).exports;
    const { code } = transformSync(readFileSync(path, "utf8"), {
      filename: path, babelrc: false, configFile: false,
      presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
    });
    const compiled = { exports: {} };
    modules.set(path, compiled);
    vm.runInNewContext(code, { module: compiled, exports: compiled.exports, require(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith("@/")) return load(id.slice(2) + ".js");
      if (id.startsWith(".")) return load(resolve(dirname(path), id + ".js"));
      return require(id);
    } });
    return compiled.exports;
  }
  return load;
}
const load = loader();
const { getHelpSections, getPageGuide } = load("components/help-ui/helpContent.js");
const { getSidebarRouteGroups } = load("components/ui/sidebar/sidebarRoutes.js");
const viewers = [
  { role: "student" }, { role: "employer" },
  { role: "department_head", department_code: "CCS" },
  { role: "department_head", department_code: "REG" }, { role: "admin" },
];

test("Help functionality cards use the shared popup with the selected guide and its destination", () => {
  const SharedModal = () => null;
  const scoped = loader({ "@/components/ui/Modal": SharedModal, "next/link": ({ children, ...props }) => React.createElement("a", props, children) });
  const Card = scoped("components/help-ui/HelpGuideCard.js").default;
  const guide = getPageGuide({ role: "admin" }, "accounts");
  const popup = Card({ guide, accountHref: "/admin/account" });
  assert.equal(popup.type, SharedModal); assert.equal(popup.props.title, guide.title); assert.equal(popup.props.description, guide.summary);
  const trigger = renderToStaticMarkup(popup.props.trigger), content = renderToStaticMarkup(popup.props.children);
  assert(trigger.includes(guide.title)); assert(!trigger.includes("<details"));
  assert(content.includes('href="/admin/create-account"')); assert.equal((content.match(/<li>/g) || []).length, guide.steps.length);
});

test("admin account manual describes current role-first creation and invitation setup", () => {
  const guide = getPageGuide({ role: "admin" }, "accounts");
  const text = guide.steps.join(" ");
  for (const detail of ["Who is this account for?", "course and gender", "department", "account preview", "EmailJS", "24 hours", "Resend invitation", "Spam or Junk", "username and new password"]) assert(text.includes(detail), detail);
  assert(text.includes("You do not choose or receive the user's password"));
});

test("each role's sidebar destinations have a guide and page lookup uses that same content", () => {
  for (const user of viewers) {
    const guides = getHelpSections(user).flatMap(section => section.guides);
    const ids = guides.map(guide => guide.id);
    assert.equal(new Set(ids).size, ids.length, user.role + " has duplicate manual IDs");
    const destinations = new Set(guides.map(guide => guide.href));
    const routes = getSidebarRouteGroups(user.role, user.department_code, "/" + user.role).flatMap(group => group.routes);
    for (const route of routes) assert(destinations.has(route.href), user.role + " needs help for " + route.href);
    for (const guide of guides) {
      assert.equal(getPageGuide(user, guide.id), guide);
      assert(guide.steps.length > 0 && guide.steps.every(step => typeof step === "string" && step.trim()));
    }
  }
});

test("help and page manual lookups exclude restricted roles and registrar-only workflows", () => {
  for (const user of [null, {}, { role: "unknown" }]) {
    assert.equal(getHelpSections(user).length, 0);
    assert.equal(getPageGuide(user, "feedback"), undefined);
  }
  const student = { role: "student" };
  for (const id of ["feedback", "map", "records", "sipp", "bulk-dtr-locations"]) assert.equal(getPageGuide(student, id), undefined);
  const employer = { role: "employer" };
  for (const id of ["calendar", "past-internships", "records", "sipp", "rotations"]) assert.equal(getPageGuide(employer, id), undefined);
  const registrar = { role: "department_head", department_code: "REG" };
  assert(getPageGuide(registrar, "sipp"));
  for (const id of ["records", "dashboard", "dtr-location", "rotations", "bulk-dtr-locations"]) assert.equal(getPageGuide(registrar, id), undefined);
  for (const user of viewers) {
    const permitted = ["admin", "employer", "department_head"].includes(user.role) && !(user.role === "department_head" && user.department_code === "REG");
    const hasRoute = getSidebarRouteGroups(user.role, user.department_code, "/").flatMap(group => group.routes).some(route => route.href === "/dtr-locations");
    assert.equal(hasRoute, permitted);
    assert.equal(Boolean(getPageGuide(user, "bulk-dtr-locations")), permitted);
  }
  for (const user of viewers) assert.equal(getPageGuide(user, "password-setup").href, "/forgot-password");
  assert.equal(getPageGuide(student, "rotations").href, "/student/internship-record");
  assert.equal(getPageGuide({ role: "admin" }, "rotations").href, "/internship-records");
  assert.equal(getPageGuide({ role: "admin", department_code: "REG" }, "sipp"), undefined);
  assert.equal(getPageGuide({ role: "department_head", department_code: "CCS" }, "sipp"), undefined);
  assert.match(getPageGuide(registrar, "announcements").steps[0], /General/);
  assert.match(getPageGuide({ role: "department_head", department_code: "CCS" }, "announcements").steps[0], /category is Department/);
});

test("feedback manuals render the correct employer or staff instructions and stay hidden from students", () => {
  for (const role of ["employer", "department_head", "admin", "student"]) {
    const user = { role, department_code: "CCS" };
    const scoped = loader({
      "@/contexts/UserContext": { useUser: () => ({ user }) },
      "@/components/ui/ManualDialog": ({ title, children }) => React.createElement("section", { "aria-label": title }, children),
    });
    const Manual = scoped("components/help-ui/HelpManual.js").default;
    const html = renderToStaticMarkup(React.createElement(Manual, { guideId: "feedback" }));
    if (role === "student") { assert.equal(html, ""); continue; }
    assert(html.includes("General Feedback"));
    assert(html.includes("Technical Issue"));
    assert(html.includes("PDF"));
    if (role === "employer") {
      assert(html.includes("Create feedback"));
      assert(html.includes("Deleting a post permanently removes"));
    } else {
      assert(html.includes("Internal note"));
      assert(html.includes("Only the employer author can edit or delete"));
    }
  }
});

test("Help searches the same full steps used in page manuals without surfacing hidden guides", () => {
  for (const user of viewers) {
    const scoped = loader({
      react: { useMemo: fn => fn(), useState: () => ["preview", () => {}] },
      "@/contexts/UserContext": { useUser: () => ({ user }) },
    });
    const readHelpGuides = scoped("components/help-ui/useHelpGuides.js").default;
    const found = readHelpGuides().visibleSections.flatMap(section => section.guides);
    assert(found.length > 0);
    for (const guide of found) {
      assert.match([guide.title, guide.summary, ...guide.steps].join(" ").toLowerCase(), /preview/);
      assert(getPageGuide(user, guide.id));
    }
    if (user.role === "student") assert(!found.some(guide => guide.id === "feedback"));
  }
});

test("Help contact instructions show admin contacts only to students and heads", () => {
  for (const role of ["student", "department_head", "employer", "admin"]) {
    const scoped = loader({
      "@/contexts/UserContext": { useUser: () => ({ user: { id: "viewer", role } }) },
      "./AdminSupportContacts": () => React.createElement("div", null, "Administrator contact list"),
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    });
    const Contact = scoped("components/help-ui/HelpContact.js").default;
    const html = renderToStaticMarkup(React.createElement(Contact));
    assert.equal(html.includes("Administrator contact list"), ["student", "department_head"].includes(role));
    if (role === "employer") { assert(html.includes('href="/feedback"')); assert(html.includes("Create feedback")); }
  }
});

test("administrator contacts render email/phone links and distinct loading, empty and failed states", () => {
  let state;
  const scoped = loader({
    "@tanstack/react-query": { useQuery: () => state },
    "@/lib/server-actions/help-actions": {},
    "@/components/ui/skeleton": { Skeleton: () => null },
    "@/components/ui/ErrorUI": ({ error }) => React.createElement("div", { role: "alert" }, error.message),
  });
  const Contacts = scoped("components/help-ui/AdminSupportContacts.js").default;
  const render = () => renderToStaticMarkup(React.createElement(Contacts, { viewerId: "viewer" }));
  state = { isPending: true }; assert(render().includes("Loading administrator contacts"));
  state = { data: [] }; assert(render().includes("No administrator email or phone number"));
  const data = [{ name: "Admin", email: "support@example.test", contact_number: "+63 912 345 6789" }];
  state = { data }; assert(render().includes('href="mailto:support%40example.test"')); assert(render().includes('href="tel:+639123456789"'));
  state = { data, isError: true, error: Object.assign(new Error("Refresh failed"), { status: 503 }) };
  assert(render().includes("Refresh failed")); assert(render().includes("support@example.test"));
  state.error.status = 403; assert(!render().includes("support@example.test"));
});
