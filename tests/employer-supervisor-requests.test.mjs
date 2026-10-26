import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React, { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { QueryClient } from "@tanstack/react-query";
import { canDeleteNotification } from "../lib/notification-permissions.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks = {}) {
  const url = new URL("../" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
  });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports,
    FormData, window: globalThis.window,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); },
  });
  return compiled.exports;
}
const e = React.createElement;
const Link = ({ children, ...props }) => e("a", props, children);
const pending = { id: 1, type: "supervisor_request_submitted", title: "New request", message: "Student requested you", created_at: "2026-10-20", link_uuid: "request", actionable: true, can_delete: false };
const mockMeta = { getNotificationItemMeta: () => ({ icon: () => null, tone: "default" }), TONE_STYLES: {}, getDropdownNotificationMeta: () => ({ icon: () => null, label: "Request" }) };

test("deletion permissions protect pending requests and allow responded or obsolete alerts", () => {
  for (const item of [pending, { ...pending, is_read: true }, { type: pending.type, actionable: true }, { type: pending.type, request_status: "pending" }]) assert.equal(canDeleteNotification(item), false);
  for (const item of [{ ...pending, actionable: false, can_delete: true, request_status: "accepted" }, { ...pending, actionable: false, can_delete: true, request_status: "superseded" }, { type: "announcement" }]) assert.equal(canDeleteNotification(item), true);
});

test("inbox and header dropdown both hide delete for unanswered requests", () => {
  const itemHook = item => ({ canDelete: canDeleteNotification(item), isActionable: item.actionable });
  const Item = load("components/notifications-ui/NotificationItem.js", {
    "@/lib/utils": { cx: (...args) => args.filter(Boolean).join(" ") },
    "./notificationMetadata": mockMeta,
    "./NotificationResponseActions": () => e("div", null, "Accept / Decline"),
    "./useNotificationItem": itemHook,
  }).default;
  const Dropdown = load("components/notifications-ui/NotificationDropdownItem.js", {
    "next/link": Link, "@/lib/utils": { cx: (...args) => args.filter(Boolean).join(" ") },
    "@/lib/notification-permissions.mjs": { canDeleteNotification },
    "@/lib/notification-routes": { getNotificationTargetPath: () => "/notifications" },
    "./notificationMetadata": mockMeta,
  }).default;
  for (const item of [pending, { ...pending, actionable: false, can_delete: true }]) {
    assert.equal(renderToStaticMarkup(e(Item, { item })).includes('title="Delete notification"'), canDeleteNotification(item));
    assert.equal(renderToStaticMarkup(e(Dropdown, { notification: item })).includes('title="Delete notification"'), canDeleteNotification(item));
  }
});

test("confirmed decisions refresh only the employer's supervision, notification and profile caches", async () => {
  const role = (id, name) => ["dashboard-overview", String(id), name];
  const interns = id => ["dashboard", String(id), "employer-interns"];
  const inboxes = id => ["notifications", String(id), "inbox"];
  const { refreshSupervisionAfterResponse } = load("lib/cache/supervision-mutations.js", {
    "./dashboard-overview-queries": { dashboardOverviewKeys: { role } },
    "./dashboard-lists-queries": { dashboardListsKeys: { employerInternsAll: interns } },
    "./notifications-queries": {
      notificationsKeys: { all: id => ["notifications", String(id)] },
      updateNotificationInboxes: (client, id, update) => client.setQueriesData({ queryKey: inboxes(id) }, old => ({ ...old, pages: old.pages.map(update) })),
    },
  });
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  const changed = [role("me", "employer"), [...interns("me"), "ongoing", 2], ["user-profile", "me", "student", "dtr"]];
  const retained = [role("other", "employer"), [...interns("other"), "all", 1], ["user-profile", "me", "another-student", "dtr"], ["feedback", "me"]];
  for (const key of [...changed, ...retained]) client.setQueryData(key, { saved: true });
  client.setQueryData([...inboxes("me"), "all", 10], { pages: [{ data: [pending, { ...pending, id: 2, link_uuid: "other" }] }] });
  try {
    await refreshSupervisionAfterResponse(client, "me", { requestId: "request", studentId: "student", decision: "accept" });
    for (const key of changed) assert.equal(client.getQueryState(key).isInvalidated, true);
    for (const key of retained) assert.equal(client.getQueryState(key).isInvalidated, false);
    const rows = client.getQueryData([...inboxes("me"), "all", 10]).pages[0].data;
    assert.equal(rows[0].actionable, false); assert.equal(rows[0].can_delete, true); assert.equal(rows[0].request_status, "accepted");
    assert.equal(rows[1].actionable, true); assert.equal(rows[1].can_delete, false);
  } finally { client.clear(); }
});

test("notification responses confirm the decision, preserve failed requests and prevent duplicate submits", async () => {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://app.test/notifications" });
  const oldWindow = globalThis.window, oldDocument = globalThis.document, oldAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let calls = 0, refreshed = 0, success = 0, finish;
  const action = async form => { calls++; assert.equal(form.get("requestId"), "request"); assert.equal(form.get("decision"), "accept"); return await new Promise(resolve => { finish = resolve; }); };
  const hook = load("lib/hooks/useSupervisorRequestResponse.js", {
    "@tanstack/react-query": { useQueryClient: () => ({}) },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "me" } }) },
    "@/lib/helpers": { toastAndAction: ({ action, args }) => action(...args) },
    "@/lib/server-actions/supervisor-actions": { respondToSupervisorRequest: action },
    "@/lib/cache/supervision-mutations": { refreshSupervisionAfterResponse: async () => { refreshed++; } },
    "@/lib/notification-events": { notifyNotificationsChanged() {} },
  }).default;
  const Actions = load("components/notifications-ui/NotificationResponseActions.js", {
    "@/components/ui/ConfirmDialog": ({ open, onConfirm }) => open ? e("button", { onClick: onConfirm }, "Confirm request") : null,
  }).default;
  function ResponseControls() {
    const { isPending, response, handleRespond } = hook({ requestId: "request", studentId: "student/a", onSuccess: () => { success++; } });
    return e("div", { "aria-busy": isPending }, response ? "Accepted" : e(React.Fragment, null, e("p", null, "Pending request"), e(Actions, { handleRespond, isPending })));
  }
  const root = createRoot(dom.window.document.getElementById("root"));
  const click = async label => {
    const button = [...dom.window.document.querySelectorAll("button")].find(node => node.textContent.trim() === label);
    assert(button, label); await act(async () => button.click());
  };
  try {
    await act(async () => root.render(e(ResponseControls)));
    assert.equal(calls, 0);
    await click("Accept"); assert.equal(calls, 0);
    await click("Confirm request"); assert.equal(calls, 1);
    assert.equal(dom.window.document.querySelector('[aria-busy="true"]') !== null, true);
    assert([...dom.window.document.querySelectorAll("button")].every(node => node.disabled));
    await act(async () => finish({ success: false, error: "Network failed" }));
    assert.match(dom.window.document.body.textContent, /Pending request/); assert.equal(refreshed, 0); assert.equal(success, 0);
    await click("Accept"); await click("Confirm request");
    await act(async () => finish({ success: true }));
    assert.equal(calls, 2); assert.equal(refreshed, 1); assert.equal(success, 1);
    assert.match(dom.window.document.body.textContent, /Accepted/);
    assert.equal(dom.window.document.querySelectorAll("button").length, 0);
  } finally {
    await act(async () => root.unmount()); dom.window.close();
    globalThis.window = oldWindow; globalThis.document = oldDocument; globalThis.IS_REACT_ACT_ENVIRONMENT = oldAct;
  }
});
