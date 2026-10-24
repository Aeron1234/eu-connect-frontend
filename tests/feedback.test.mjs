import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { audienceDepartments, validateFeedbackFiles, canUseFeedback, canManageFeedback } from "../lib/feedback.mjs";
import * as labels from "../lib/feedback.mjs";
import { getNotificationTargetPath } from "../lib/notification-routes.js";
const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(relative, mocks, globals = {}) {
  const url = new URL("../" + relative, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, FormData: globals.FormData || FormData, console, ...globals,
    require(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id === "@/components/ui/PdfPreviewProvider") return { usePdfPreview: () => ({ previewPdf() {} }) };
      if (id === "./FeedbackAttachments") return load("components/feedback-ui/FeedbackAttachments.js", {
        react: React, "next/image": props => { const attributes = { ...props }; delete attributes.unoptimized; return e("img", attributes); },
        "lucide-react": { FileText: () => null, Download: () => null, RefreshCw: () => null },
        "@/components/ui/button": { Button }, "@/components/ui/Modal": ({ trigger }) => e("div",null,trigger),
      }).default;
      if (id === "@/components/help-ui/HelpManual") return () => null;
      if (id === "./FeedbackComposer") return () => null;
      if (id === "./FeedbackAuthorActions") return { FeedbackActionButtons: () => null, FeedbackDeleteDialog: () => null, FeedbackReplyEditor: () => null };
      return require(id);
    } });
  return mod.exports;
}
const e = React.createElement;
const Button = ({ children, ...props }) => e("button", props, children);
const ErrorUI = ({ error }) => e("p", { role: "alert" }, error.message);
const Select = ({ label, value, options, disabled }) => e("select", { "aria-label": label, value, disabled, onChange() {} }, options.map(o => e("option", { key: o.value, value: o.value }, o.label)));
function hookState() {
  let cursor = 0; const values = [];
  return { reset() { cursor = 0; }, hooks: { ...React, useEffect() {}, useState(initial) { const i = cursor++; if (!(i in values)) values[i] = initial; return [values[i], value => { values[i] = typeof value === "function" ? value(values[i]) : value; }]; } } };
}
function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return null;
  if (predicate(tree)) return tree;
  for (const child of React.Children.toArray(tree.props?.children)) { const match = find(child, predicate); if (match) return match; }
  return null;
}
test("audience preview de-duplicates department heads and ignores unrelated interns", () => {
  assert.deepEqual(audienceDepartments([{ id: "a", department_code: "CCS" }, { id: "b", department_code: "CCS" }, { id: "c", department_code: "CITHM" }, { id: "d", department_code: "CBA" }], ["a","b","c"]), ["CCS","CITHM"]);
  assert.deepEqual(audienceDepartments([], []), []);
});
test("file limits and role controls fail closed", () => {
  assert.equal(validateFeedbackFiles([{ type: "application/pdf", size: 500 }]), "");
  assert(validateFeedbackFiles(Array(4).fill({ type: "image/png", size: 10 })));
  assert(validateFeedbackFiles([{ type: "image/png", size: 5*1024*1024+1 }]));
  assert(validateFeedbackFiles([{ type: "image/svg+xml", size: 10 }]));
  assert.equal(canUseFeedback("student"), false); assert.equal(canUseFeedback("employer"), true);
  assert.equal(canManageFeedback("employer"), false); assert.equal(canManageFeedback("department_head"), true);
});
test("all feedback notification types deep-link to the correct discussion with safe IDs", () => {
  for (const type of ["feedback_mentioned", "feedback_reply", "feedback_status"]) {
    assert.equal(getNotificationTargetPath({ type, link_uuid: "a/b?" }), "/feedback?post=a%2Fb%3F");
    assert.equal(getNotificationTargetPath({ type }), "/feedback");
  }
});
test("thread has mobile full-screen and desktop split-view layout, without exposing staff controls to employers", () => {
  const state = hookState();
  const data = { post: { id: "post", category: "internship_feedback", status: "open", subject: "Private feedback", description: "Details", author_name: "Employer" }, mentions: [{ internship_id: "a", student_name: "Student", department_code: "CCS" }], attachments: [{ id: "file", filename: "proof.pdf", size_bytes: 1000 }], replies: [] };
  const component = load("components/feedback-ui/FeedbackThread.js", {
    react: state.hooks, "@tanstack/react-query": { useQuery: () => ({ data }), useQueryClient: () => ({ invalidateQueries() {} }) },
    "lucide-react": { ArrowLeft: () => null, MessageSquare: () => null, Paperclip: () => null, LockKeyhole: () => null, Send: () => null },
    sonner: { toast: {} }, "@/components/ui/button": { Button }, "@/components/ui/ErrorUI": ErrorUI,
    "@/lib/cache/feedback-queries": { feedbackDetailOptions: () => ({}), feedbackKeys: { all: id => ["feedback",id] } },
    "@/lib/server-actions/feedback-actions": {}, "@/lib/feedback.mjs": labels,
    "@/lib/helpers": { toastAndAction() {} }, "@/lib/toast-and-action.mjs": { showActionError() {} }, "./FeedbackSelect": Select,
  }).default;
  state.reset(); const html = renderToStaticMarkup(component({ id: "post", user: { id: "employer", role: "employer" }, onBack() {} }));
  assert.match(html, /fixed inset-0/); assert.match(html, /lg:static/); assert.match(html, /overflow-y-auto/);
  assert.match(html, /Back to feedback feed/); assert.match(html, /CCS Head/);
  assert.match(html, /api\/feedback\/post\/attachments\/file/);
  assert.doesNotMatch(html, /Internal note|Discussion status/);
  state.reset(); const staff = renderToStaticMarkup(component({ id: "post", user: { id: "head", role: "department_head" }, onBack() {} }));
  assert.match(staff, /Internal note/); assert.match(staff, /Discussion status/);
});
test("cached private thread is hidden when fresh authorization is denied", () => {
  const state = hookState();
  const component = load("components/feedback-ui/FeedbackThread.js", {
    react: state.hooks, "@tanstack/react-query": { useQuery: () => ({ data: { post: { subject: "Old confidential text" } }, isError: true, error: { message: "Access denied", status: 403 } }), useQueryClient: () => ({}) },
    "lucide-react": { ArrowLeft: () => null, MessageSquare: () => null, Paperclip: () => null, LockKeyhole: () => null, Send: () => null },
    sonner: { toast: {} }, "@/components/ui/button": { Button }, "@/components/ui/ErrorUI": ErrorUI,
    "@/lib/cache/feedback-queries": { feedbackDetailOptions: () => ({}), feedbackKeys: {} },
    "@/lib/server-actions/feedback-actions": {}, "@/lib/feedback.mjs": labels,
    "@/lib/helpers": {}, "@/lib/toast-and-action.mjs": {}, "./FeedbackSelect": Select,
  }).default;
  state.reset(); const html = renderToStaticMarkup(component({ id: "post", user: { id: "head", role: "department_head" }, onBack() {} }));
  assert.match(html, /Access denied/); assert.doesNotMatch(html, /Old confidential text/);
});
test("reply validation preserves draft, sends to selected discussion, and clears only after success", async () => {
  const state = hookState(), calls = [], errors = [];
  let result = { success: false, error: "Try again" };
  const component = load("components/feedback-ui/FeedbackThread.js", {
    react: state.hooks, "@tanstack/react-query": { useQuery: () => ({ data: { post: { status: "open" }, mentions: [], attachments: [], replies: [] } }), useQueryClient: () => ({ invalidateQueries() {} }) },
    "lucide-react": {}, sonner: { toast: {} }, "@/components/ui/button": { Button }, "@/components/ui/ErrorUI": ErrorUI,
    "@/lib/cache/feedback-queries": { feedbackDetailOptions: () => ({}), feedbackKeys: { all: id => ["feedback",id] } },
    "@/lib/server-actions/feedback-actions": { postFeedbackReply: "reply-action" }, "@/lib/feedback.mjs": labels,
    "@/lib/helpers": { async toastAndAction(options) { calls.push(options); return result; } },
    "@/lib/toast-and-action.mjs": { showActionError(t, message) { errors.push(message); } }, "./FeedbackSelect": Select,
  }).default;
  const render = () => { state.reset(); return component({ id: "specific-post", user: { id: "employer", role: "employer" }, onBack() {} }); };
  let tree = render();
  await find(tree, n => n.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(errors.length, 1); assert.equal(calls.length, 0);
  find(tree, n => n.type === "textarea").props.onChange({ target: { value: "My reply" } });
  tree = render(); await find(tree, n => n.type === "form").props.onSubmit({ preventDefault() {} });
  assert.deepEqual(Array.from(calls[0].args), ["specific-post", "My reply", false]);
  assert.equal(find(render(), n => n.type === "textarea").props.value, "My reply");
  result = { success: true };
  await find(render(), n => n.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(find(render(), n => n.type === "textarea").props.value, "");
});

test("composer tags only internship feedback, previews unique heads, and preserves the form after server failure", async () => {
  const state = hookState(), submissions = [], posted = [], queryOptions = [];
  let response = { success: false, error: "Try again" };
  class Form {
    constructor(seed = {}) { this.values = new Map(Object.entries(seed)); }
    set(key, value) { this.values.set(key,value); }
    append(key, value) { this.values.set(key,value); }
    get(key) { return this.values.get(key); }
  }
  const modal = {
    Root: props => e("form",props,props.children), Footer: props => e("footer",null,props.children),
    Section: ({ children }) => e("section",null,children), Field: ({ children }) => e("label",null,children),
    Input: props => e("input",props), Textarea: props => e("textarea",props),
  };
  const component = load("components/feedback-ui/FeedbackComposer.js", {
    react: state.hooks, "@tanstack/react-query": { useQuery(options) { queryOptions.push(options); return { data: { interns: [{ id: "a", student_name: "Ana", department_code: "CCS" }, { id: "b", student_name: "Ben", department_code: "CCS" }, { id: "c", student_name: "Cara", department_code: "CITHM" }] } }; } },
    sonner: { toast: {} }, "@/components/ui/dialog": Object.fromEntries(["Dialog","DialogContent","DialogHeader","DialogTitle","DialogDescription"].map(name => [name, ({children}) => e("div",null,children)])),
    "@/components/ui/button": { Button }, "@/components/ui/ModalForm": modal, "@/components/ui/ErrorUI": ErrorUI,
    "@/components/ui/FormDialogContent": ({ children }) => e("div",null,children),
    "@/components/ui/modalFormStyles": { modalFormCancelClass: "cancel", modalFormPrimaryClass: "primary" },
    "@/lib/cache/feedback-queries": { feedbackInternOptions: () => ({}) }, "@/lib/feedback.mjs": labels,
    "@/lib/server-actions/feedback-actions": { createFeedback: "create" },
    "@/lib/helpers": { async toastAndAction(options) { submissions.push(options); return response; } },
    "@/lib/toast-and-action.mjs": { showActionError() {} }, "./FeedbackSelect": Select,
  }, { FormData: Form }).default;
  const render = () => { state.reset(); return component({ userId: "employer", onClose() {}, onPosted: id => posted.push(id) }); };
  let tree = render();
  assert.equal(queryOptions.at(-1).enabled, false);
  assert(!find(tree, n => n.props?.["aria-label"] === "Related internships"));
  find(tree, n => n.props?.label === "Category" && typeof n.props.onValueChange === "function").props.onValueChange("internship_feedback");
  tree = render();
  assert.equal(queryOptions.at(-1).enabled, true);
  const all = find(tree, n => n.type === Button && n.props.children === "Select all my interns");
  all.props.onClick();
  tree = render();
  const preview = find(tree, n => n.props?.["aria-live"] === "polite");
  const html = renderToStaticMarkup(preview);
  assert.match(html, /CCS Head, CITHM Head/); assert.equal((html.match(/CCS Head/g) || []).length, 1);
  const submit = () => find(render(), n => n.type === modal.Root).props.onSubmit({ preventDefault() {}, currentTarget: { subject: "Title", description: "Details" } });
  await submit();
  assert.equal(submissions[0].args[0].get("internshipIds"), '["a","b","c"]'); assert.equal(posted.length, 0);
  assert.equal(find(render(), n => n.type === "fieldset").props.disabled, false);
  response = { success: true, id: "new-post" }; await submit(); assert.deepEqual(posted, ["new-post"]);
  find(tree, n => n.props?.label === "Category" && typeof n.props.onValueChange === "function").props.onValueChange("platform_feedback");
  tree = render();
  assert(!find(tree, n => n.props?.["aria-label"] === "Related internships"));
  assert.doesNotMatch(renderToStaticMarkup(find(tree, n => n.props?.["aria-live"] === "polite")), /CCS Head|CITHM Head/);
  find(tree, n => n.props?.label === "Category" && typeof n.props.onValueChange === "function").props.onValueChange("general_feedback");
  tree = render();
  assert.match(renderToStaticMarkup(find(tree, n => n.props?.["aria-live"] === "polite")), /you, Admin, all department heads/);
  find(tree, n => n.props?.label === "Category" && typeof n.props.onValueChange === "function").props.onValueChange("technical_issue");
  tree = render();
  const technicalAudience = renderToStaticMarkup(find(tree, n => n.props?.["aria-live"] === "polite"));
  assert.match(technicalAudience, /you, Admin/);
  assert.doesNotMatch(technicalAudience, /all department heads|CCS Head|CITHM Head/);
});
test("feedback navigation is available to employer/staff and absent for students", () => {
  const icons = new Proxy({}, { get: () => () => null });
  const routes = load("components/ui/sidebar/sidebarRoutes.js", { "lucide-react": icons }).getSidebarRouteGroups;
  for (const role of ["employer","department_head","admin","student"]) {
    const hrefs = routes(role,"CCS","/" + role).flatMap(group => group.routes.map(route => route.href));
    assert.equal(hrefs.includes("/feedback"), role !== "student");
  }
});

test("live updates retain earlier replies when the latest reply window advances", () => {
  const make = n => ({ id: String(n).padStart(3, "0"), body: "Reply " + n, created_at: new Date(1700000000000 + n * 1000).toISOString() });
  const previous = { post: { id: "post" }, replies: Array.from({ length: 100 }, (_, n) => make(n)), moreReplies: false };
  const next = { post: { id: "post", status: "in_review" }, replies: Array.from({ length: 100 }, (_, n) => make(n+1)), moreReplies: true };
  const merged = labels.mergeFeedbackDetail(previous, next);
  assert.equal(merged.replies.length, 101);
  assert.deepEqual(merged.replies.map(r => r.id), Array.from({ length: 101 }, (_, n) => String(n).padStart(3, "0")));
  assert.equal(merged.post.status, "in_review");
  assert.equal(labels.mergeFeedbackDetail(previous, { post: { id: "different" }, replies: [] }).replies.length, 0);
});

test("attachment proxy authorizes first, keeps downloads private, and never fetches storage after access denial", async () => {
  let token = null; const requests = [];
  let backend = Response.json({ error: "Not allowed" }, { status: 404 });
  const route = load("app/api/feedback/[postId]/attachments/[attachmentId]/route.js", {
    "@/lib/server-actions/auth": { async getAccessToken() { return token; } },
    "@/lib/api-base-url.mjs": { getApiBaseUrl: () => "https://backend.invalid/api/v1" },
  }, { Response, URL, AbortSignal, async fetch(url, options) {
    requests.push({ url: String(url), options });
    if (String(url).startsWith("https://backend.invalid")) return backend;
    return new Response("%PDF-1.7 content");
  } });
  const params = { params: Promise.resolve({ postId: "post", attachmentId: "file" }) };
  assert.equal((await route.GET({ url: "https://frontend.invalid/api/feedback/post/attachments/file" }, params)).status, 401); assert.equal(requests.length, 0);
  token = "server-only-token";
  assert.equal((await route.GET({ url: "https://frontend.invalid/api/feedback/post/attachments/file" }, params)).status, 404); assert.equal(requests.length, 1);
  backend = Response.json({ url: "https://storage.invalid/signed", filename: "proof.pdf", mime: "application/pdf" });
  const res = await route.GET({ url: "https://frontend.invalid/api/feedback/post/attachments/file" }, params);
  assert.equal(res.status, 200); assert.match(res.headers.get("cache-control"), /private, no-store/);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.match(res.headers.get("content-disposition"), /proof.pdf/);
  assert.equal(requests.at(-1).options.credentials, "omit");
  assert.equal(requests.at(-1).options.headers, undefined);
});

test("category audience labels show general feedback to all heads and keep technical issues admin-only", () => {
  assert.equal(labels.feedbackAudience("general_feedback", ["CCS","CITHM"]), "you, Admin, all department heads");
  assert.equal(labels.feedbackAudience("technical_issue", ["CCS"]), "you, Admin");
  assert.equal(labels.feedbackAudience("platform_feedback", ["CITHM"]), "you, Admin");
  assert.equal(labels.feedbackAudience("internship_feedback", ["CCS","CCS","CITHM"]), "you, Admin, CCS Head, CITHM Head");
  assert.equal(labels.feedbackAudience("general_feedback", [], "author"), "author, Admin, all department heads");
});


function createFeedbackTestClient() {
  const { QueryClient } = require("@tanstack/react-query");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Babel fixtures run in a VM realm. Normalize keys at the bridge so TanStack's
  // native-realm plain-object hashing matches the single realm used in the app.
  const keyed = new Set(["fetchQuery", "cancelQueries", "invalidateQueries", "getQueryData", "getQueryState", "setQueryData"]);
  return new Proxy(client, { get(target, property) {
    const method = target[property];
    if (typeof method !== "function") return method;
    if (!keyed.has(property)) return method.bind(target);
    return (arg, ...rest) => {
      const normalize = value => JSON.parse(JSON.stringify(value));
      const first = Array.isArray(arg) ? normalize(arg) :
        arg?.queryKey ? { ...arg, queryKey: normalize(arg.queryKey) } : arg;
      return method.call(target, first, ...rest);
    };
  } });
}

function feedbackQueryFixture(overrides = {}) {
  return load("lib/cache/feedback-queries.js", {
    "../feedback.mjs": labels,
    "../server-actions/feedback-actions": {
      async getFeedbackFeed() { return { success: true, posts: [], page: 1, total: 0, totalPages: 1 }; },
      async getFeedbackDetail() { return { success: true, post: { id: "created", author_id: "owner" }, mentions: [], attachments: [], replies: [] }; },
      async getFeedbackInterns() { return { success: true, interns: [] }; },
      ...overrides,
    },
  });
}
function savedFeedback() {
  return { post: { id: "created", author_id: "owner", category: "general_feedback", status: "open", subject: "Just posted", created_at: "2026-10-24T12:00:00Z" },
    mentions: [{ internship_id: "record", student_name: "Ana", department_code: "CCS" }],
    attachments: [{ id: "file", filename: "proof.pdf" }], replies: [], moreReplies: false };
}

test("successful creation immediately seeds feed and thread, drops duplicates, and invalidates old filters only for this user", async () => {
  const client = createFeedbackTestClient();
  const q = feedbackQueryFixture(), filters = { category: "all", status: "all", page: 1, search: "" };
  const key = q.feedbackKeys.list("owner", filters, "employer");
  const other = q.feedbackKeys.list("other", filters, "employer");
  const filtered = q.feedbackKeys.list("owner", { ...filters, status: "resolved", page: 3 }, "employer");
  try {
    client.setQueryData(key, { posts: Array.from({ length: 15 }, (_, n) => ({ id: "old-" + n })), page: 1, total: 15, totalPages: 1 });
    client.setQueryData(other, { posts: [{ id: "private-other" }] });
    client.setQueryData(filtered, { posts: [], page: 3, total: 31, totalPages: 3 });
    await q.cacheCreatedFeedback(client, { userId: "owner", role: "employer", id: "created", detail: savedFeedback() });
    let feed = client.getQueryData(key);
    assert.equal(feed.posts[0].id, "created"); assert.equal(feed.posts.length, 15);
    assert.equal(feed.posts[0].attachment_count, 1); assert.equal(feed.posts[0].mentions[0].student_name, "Ana");
    assert.equal(feed.total, 16); assert.equal(feed.totalPages, 2);
    assert.equal(client.getQueryData(q.feedbackKeys.detail("owner","created","employer")).post.subject, "Just posted");
    assert.equal(client.getQueryState(filtered).isInvalidated, true);
    assert.equal(client.getQueryState(other).isInvalidated, false);
    await q.cacheCreatedFeedback(client, { userId: "owner", role: "employer", id: "created", detail: savedFeedback() });
    feed = client.getQueryData(key);
    assert.equal(feed.posts.filter(p => p.id === "created").length, 1);
    assert.equal(feed.total, 16);
  } finally { client.clear(); }
});

test("a slow pre-mutation read cannot overwrite the newly posted feedback", async () => {
  const client = createFeedbackTestClient();
  const q = feedbackQueryFixture(), filters = { category: "all", status: "all", page: 1, search: "" };
  const key = q.feedbackKeys.list("owner", filters, "employer");
  let finish;
  const oldRead = client.fetchQuery({ queryKey: key, queryFn: () => new Promise(resolve => { finish = resolve; }) }).catch(() => {});
  try {
    await q.cacheCreatedFeedback(client, { userId: "owner", role: "employer", id: "created", detail: savedFeedback() });
    finish({ posts: [], page: 1, total: 0, totalPages: 1 });
    await oldRead;
    await Promise.resolve();
    assert.equal(client.getQueryData(key).posts[0].id, "created");
  } finally { client.clear(); }
});

test("older backend responses fetch an authorized saved detail before seeding; mismatched ownership is rejected", async () => {
  const client = createFeedbackTestClient();
  let reads = 0;
  const q = feedbackQueryFixture({ async getFeedbackDetail() { reads++; return { success: true, ...savedFeedback() }; } });
  try {
    await q.cacheCreatedFeedback(client, { userId: "owner", role: "employer", id: "created" });
    assert.equal(reads, 1);
    assert.equal(client.getQueryData(q.feedbackKeys.detail("owner","created","employer")).post.id, "created");
    const bad = feedbackQueryFixture({ async getFeedbackDetail() { return { success: true, post: { id: "foreign", author_id: "someone-else" } }; } });
    await assert.rejects(() => bad.cacheCreatedFeedback(client, { userId: "owner", role: "employer", id: "foreign" }), /Could not confirm/);
    assert.equal(client.getQueryData(q.feedbackKeys.detail("owner","foreign","employer")), undefined);
  } finally { client.clear(); }
});

test("posting from page two with restrictive filters reveals the saved post before the refresh completes, without sockets", async () => {
  const client = createFeedbackTestClient();
  let finishRefresh, refreshing = false;
  const q = feedbackQueryFixture({ getFeedbackFeed: () => {
    refreshing = true; return new Promise(resolve => { finishRefresh = resolve; });
  } });
  const state = hookState(), navigations = [];
  const Empty = () => null;
  const Composer = () => null;
  const options = [];
  const board = load("components/feedback-ui/FeedbackBoard.js", {
    react: { ...state.hooks, useCallback: callback => callback },
    "next/navigation": { useRouter: () => ({ push: path => navigations.push(path) }), useSearchParams: () => ({ get: () => null }) },
    "@tanstack/react-query": { useQueryClient: () => client, useQuery: query => {
      options.push(query); return { data: client.getQueryData(query.queryKey) || { posts: [], page: query.queryKey.at(-1).page, totalPages: 3 } };
    } },
    "lucide-react": { MessageSquare: Empty, Plus: Empty, LockKeyhole: Empty },
    "@/contexts/UserContext": { useUser: () => ({ user: { id: "owner", role: "employer" } }) },
    "@/components/ui/button": { Button }, "@/components/ui/ErrorUI": ErrorUI,
    "@/components/ui/SocketProvider": { socket: {} }, "@/lib/cache/feedback-queries": q, "@/lib/feedback.mjs": labels,
    "./FeedbackComposer": Composer, "@/components/ui/DropdownFilter": Select, "@/components/ui/SearchBar": Empty,
    "./FeedbackThread": { default: Empty, feedbackTime: () => "" },
  }).default;
  const render = () => { state.reset(); return board(); };
  try {
    let tree = render();
    find(tree, n => n.type === Select && n.props.placeholder === "Status").props.onValueChange("resolved");
    tree = render();
    find(tree, n => n.type === Button && n.props.children === "Next").props.onClick();
    tree = render();
    assert.equal(options.at(-1).queryKey.at(-1).page, 2);
    assert.equal(options.at(-1).queryKey.at(-1).status, "resolved");
    find(tree, n => n.type === Button && Array.isArray(n.props.children) && n.props.children.includes("Create feedback")).props.onClick();
    tree = render();
    const pending = find(tree, n => n.type === Composer).props.onPosted("created", savedFeedback());
    for (let tick = 0; tick < 12 && !refreshing; tick++) await Promise.resolve();
    tree = render();
    assert.equal(options.at(-1).queryKey.at(-1).page, 1);
    assert.equal(options.at(-1).queryKey.at(-1).status, "all");
    assert.equal(find(tree, n => n.type === "h2" && n.props.children === "Just posted").props.children, "Just posted");
    assert.equal(find(tree, n => n.type === Composer), null);
    assert.equal(navigations.at(-1), "/feedback?post=created");
    assert.equal(refreshing, true);
    finishRefresh({ success: true, posts: [{ ...savedFeedback().post }], page: 1, total: 1, totalPages: 1 });
    await pending;
  } finally { client.clear(); }
});

test("reply revision changes discard edited/deleted history instead of merging stale rows back", () => {
  const old={post:{id:"post",reply_version:1},replies:[{id:"deleted",body:"Old"}]};
  const next={post:{id:"post",reply_version:2},replies:[]};
  assert.equal(labels.mergeFeedbackDetail(old,next),next);
});

test("PDF attachments use shared preview and images are visible inline behind the authenticated endpoint", async () => {
  const previews=[], requests=[];
  const Attachment=load("components/feedback-ui/FeedbackAttachments.js",{
    react:React, "next/image":props=>{const attributes={...props};delete attributes.unoptimized;return e("img",attributes);},
    "lucide-react":{FileText:()=>null,Download:()=>null,RefreshCw:()=>null},
    "@/components/ui/button":{Button},
    "@/components/ui/Modal":({trigger})=>e("div",null,trigger),
    "@/components/ui/PdfPreviewProvider":{usePdfPreview:()=>({previewPdf:request=>previews.push(request)})},
  },{fetch:async(url,options)=>{requests.push({url,options});return new Response("%PDF-1.7");}}).default;
  const tree=Attachment({postId:"private-post",attachments:[{id:"pdf",filename:"report.pdf",mime_type:"application/pdf"},{id:"image",filename:"photo.png",mime_type:"image/png"}]});
  const html=renderToStaticMarkup(tree);
  assert.match(html, /<img[^>]+src="\/api\/feedback\/private-post\/attachments\/image/);
  assert.match(html, /Preview PDF/);assert.match(html,/download=1/);
  find(tree,node=>node.type==="button").props.onClick();
  assert.equal(previews[0].filename,"report.pdf");
  await previews[0].load();
  assert.equal(requests[0].url,"/api/feedback/private-post/attachments/pdf");
  assert.equal(requests[0].options.cache,"no-store");
});

test("discussion clips the composer to rounded corners and shows edit/delete only for the author", () => {
  const state=hookState();
  const Actions=({label,onEdit,onDelete})=>e("div",null,e("button",{"aria-label":"Edit "+label,onClick:onEdit}),e("button",{"aria-label":"Delete "+label,onClick:onDelete}));
  const data={post:{id:"post",author_id:"owner",category:"general_feedback",status:"open",subject:"Post"},mentions:[],attachments:[],replies:[
    {id:"own",author_id:"owner",body:"My reply"},{id:"other",author_id:"head",body:"Head reply"}]};
  const Component=load("components/feedback-ui/FeedbackThread.js",{
    react:state.hooks,"@tanstack/react-query":{useQuery:()=>({data}),useQueryClient:()=>({})},
    "lucide-react":{ArrowLeft:()=>null,MessageSquare:()=>null,LockKeyhole:()=>null,Send:()=>null},sonner:{toast:{}},
    "@/components/ui/button":{Button},"@/components/ui/ErrorUI":ErrorUI,
    "@/lib/cache/feedback-queries":{feedbackDetailOptions:()=>({}),feedbackKeys:{}},
    "@/lib/server-actions/feedback-actions":{},"@/lib/feedback.mjs":labels,"@/lib/helpers":{},"@/lib/toast-and-action.mjs":{},
    "./FeedbackSelect":Select,"./FeedbackAttachments":()=>null,
    "./FeedbackAuthorActions":{FeedbackActionButtons:Actions,FeedbackDeleteDialog:()=>null,FeedbackReplyEditor:()=>null},
  }).default;
  const render=role=>{state.reset();return renderToStaticMarkup(Component({id:"post",user:role,onBack(){}}));};
  const owner=render({id:"owner",role:"employer"});
  assert.match(owner,/overflow-hidden/);assert.match(owner,/lg:rounded-xl/);
  assert.equal((owner.match(/aria-label="Edit feedback"/g)||[]).length,1);
  assert.equal((owner.match(/aria-label="Edit reply"/g)||[]).length,1);
  const head=render({id:"head",role:"department_head"});
  assert.doesNotMatch(head,/aria-label="Edit feedback"/);
  assert.equal((head.match(/aria-label="Edit reply"/g)||[]).length,1);
  const admin=render({id:"admin",role:"admin"});
  assert.doesNotMatch(admin,/aria-label="Edit feedback"|aria-label="Edit reply"/);
});

test("deletion removes cached posts and details while leaving other users' feedback untouched", async () => {
  const client=createFeedbackTestClient(),q=feedbackQueryFixture();
  const filters={category:"all",status:"all",page:1,search:""};
  const key=q.feedbackKeys.list("owner",filters,"employer"),other=q.feedbackKeys.list("other",filters,"employer");
  try{
    client.setQueryData(key,{posts:[{id:"deleted"},{id:"keep"}],total:2});
    client.setQueryData(other,{posts:[{id:"deleted"}],total:1});
    client.setQueryData(q.feedbackKeys.detail("owner","deleted","employer"),{post:{id:"deleted"}});
    await q.removeCachedFeedback(client,"owner","deleted");
    assert.equal(client.getQueryData(key).posts.length,1);
    assert.equal(client.getQueryData(key).total,1);
    assert.equal(client.getQueryData(q.feedbackKeys.detail("owner","deleted","employer")),undefined);
    assert.equal(client.getQueryData(other).posts.length,1);
  }finally{client.clear();}
});
