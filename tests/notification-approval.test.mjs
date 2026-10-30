import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { getNotificationTargetPath } from "../lib/notification-routes.js";

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
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); },
  });
  return compiled.exports;
}
const Link = ({ children, ...props }) => React.createElement("a", props, children);
const { invalidateNotificationTarget } = load("components/notifications-ui/notificationActions.js", {
  sonner: {}, "@/lib/server-actions/notifications-actions": {}, "@/lib/cache/user-profile-queries": {},
  "@/lib/cache/student-records-queries": { studentRecordsKeys: { all: id => ["student-records", String(id)] } },
});

test("approval toast links to My Records and its close button only dismisses the popup", () => {
  let renderToast, opened = 0;
  const dismissed = [];
  const { showNotificationToast } = load("components/ui/NotificationToast.js", {
    "next/link": { __esModule: true, default: Link },
    "@/lib/notification-routes": { getNotificationTargetPath },
    sonner: { toast: { custom: render => { renderToast = render; }, dismiss: id => dismissed.push(id) } },
  });
  showNotificationToast({ type: "internship_record_approved", title: "Internship Record Approved", message: "Your placement was approved." }, { onOpen: () => { opened++; } });
  const toastElement = renderToast("toast-id");
  const dom = new JSDOM(renderToStaticMarkup(toastElement));
  try {
    assert.equal(dom.window.document.querySelector("a").getAttribute("href"), "/student/internship-record");
    assert.match(dom.window.document.querySelector("a").textContent, /View internship record/);
    assert.ok(dom.window.document.querySelector('button[aria-label="Dismiss notification popup"]'));
  } finally { dom.window.close(); }
  toastElement.props.onDismiss(); assert.equal(opened, 0); assert.deepEqual(dismissed, ["toast-id"]);
  toastElement.props.onOpen(); assert.equal(opened, 1);
  showNotificationToast({ type: "announcement", title: "Announcement" });
  assert.equal(renderToast("other-toast").props.destination, "/notifications");
});

test("read and unread approval inbox clicks refresh only the viewer's records and navigate to My Records", async () => {
  for (const is_read of [false, true]) {
    const destinations = [], invalidated = [], marked = []; let changed = 0;
    const hook = load("components/notifications-ui/useNotificationItem.js", {
      react: { useState: initial => [initial, () => {}], useTransition: () => [false, () => {}] },
      "next/navigation": { useRouter: () => ({ push: path => destinations.push(path) }) },
      "@tanstack/react-query": { useQueryClient: () => ({ invalidateQueries: ({ queryKey }) => invalidated.push(queryKey) }) },
      "@/contexts/UserContext": { useUser: () => ({ user: { id: "student", role: "student" } }) },
      "@/lib/helpers": {}, "@/lib/notification-routes": { getNotificationTargetPath },
      "@/lib/server-actions/notifications-actions": { markAsRead: async id => { marked.push(id); return { success: true }; } },
      "@/lib/hooks/useSupervisorRequestResponse": { __esModule: true, default: () => ({ isPending: false, handleRespond() {} }) },
      "@/lib/notification-permissions.mjs": { canDeleteNotification: () => true },
      "./notificationActions": { invalidateNotificationTarget },
    }).default;
    const controls = hook({ id: 7, type: "internship_record_approved", link_uuid: "record", is_read, actionable: false }, () => { changed++; });
    assert.equal(controls.isClickable, true); controls.handleOpen(); await Promise.resolve();
    assert.deepEqual(destinations, ["/student/internship-record"]);
    assert.deepEqual(invalidated, [["student-records", "student"]]);
    assert.deepEqual(marked, is_read ? [] : [7]); assert.equal(changed, is_read ? 0 : 1);
  }
});

test("opening a live approval refreshes My Records and leaving the page removes the socket listener", () => {
  const invalidated = []; let handle, cleanup, popup;
  const Alert = load("components/ui/Alert.js", {
    react: { useEffect: effect => { cleanup = effect(); } },
    "./SocketProvider": { socket: { on: (event, callback) => { if (event === "new_notification") handle = callback; }, off: (event, callback) => { if (event === "new_notification") assert.equal(callback, handle); } } },
    "./NotificationToast": { showNotificationToast: (_data, options) => { popup = options; } },
    "@tanstack/react-query": { useQueryClient: () => ({ invalidateQueries: ({ queryKey }) => invalidated.push(queryKey) }) },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "student" } }) },
    "@/components/notifications-ui/notificationActions": { invalidateNotificationTarget },
  }).default;
  Alert(); handle({ type: "internship_record_approved" }); assert.equal(invalidated.length, 0);
  popup.onOpen(); assert.deepEqual(invalidated, [["student-records", "student"]]);
  handle({ type: "announcement" }); popup.onOpen(); assert.equal(invalidated.length, 2);
  cleanup();
});
