import test from "node:test";
import assert from "node:assert/strict";
import { createToastAndAction } from "../lib/toast-and-action.mjs";

function harness() {
  const events = [];
  let sequence = 0;
  const toast = {
    loading(message) {
      const id = ++sequence;
      events.push({ type: "loading", message, id });
      return id;
    },
    success(message, options) { events.push({ type: "success", message, ...options }); },
    error(message, options) { events.push({ type: "error", message, ...options }); },
  };
  return { run: createToastAndAction(toast), events };
}

test("actions with no payload receive no artificial state or data argument", async () => {
  const { run, events } = harness();
  let received;
  const result = { success: true, message: "Break started.", status: "ON_BREAK" };
  assert.equal(await run({ action: (...args) => { received = args; return result; } }), result);
  assert.deepEqual(received, []);
  assert.equal(events[1].message, "Break started.");
  assert.equal(events[1].id, events[0].id);
});

test("FormData and object payloads reach the action unchanged as its first argument", async () => {
  const { run } = harness();
  const form = new FormData();
  form.set("recordId", "record-1");
  form.append("course_ids", "1");
  form.append("course_ids", "2");
  for (const payload of [form, { fileId: 7, internshipId: "internship-1" }]) {
    await run({ action: (...args) => {
      assert.equal(args.length, 1);
      assert.equal(args[0], payload);
      return { success: true };
    }, args: [payload] });
  }
  assert.deepEqual(form.getAll("course_ids"), ["1", "2"]);
});

test("multiple arguments keep their order, including zero IDs and explicit null", async () => {
  const { run } = harness();
  const form = new FormData();
  await run({ action: (...args) => {
    assert.deepEqual(args, [0, form, false, null]);
    return { success: true };
  }, args: [0, form, false, null] });
});

test("success feedback uses backend text or the label and returns the original result", async () => {
  const { run, events } = harness();
  const result = { success: true, report: { id: 9 }, message: "Saved by server." };
  assert.equal(await run({ action: async () => result, loadingLabel: "Saving...", successLabel: "Saved." }), result);
  assert.deepEqual(events.map(({ type, message }) => ({ type, message })), [
    { type: "loading", message: "Saving..." },
    { type: "success", message: "Saved by server." },
  ]);
  assert.equal(events[1].duration, 3000);
  assert.deepEqual(events[1].style, { backgroundColor: "#DCFCE7", color: "#166534" });
  await run({ action: () => ({ success: true }), successLabel: "Saved." });
  assert.equal(events.at(-1).message, "Saved.");
});

test("reported failures and missing results replace the loading toast with one error", async () => {
  const { run, events } = harness();
  const failure = { success: false, error: "This record cannot be edited.", status: 403 };
  assert.equal(await run({ action: () => failure, errorLabel: "Save failed." }), failure);
  assert.equal(events[1].message, failure.error);
  assert.equal(events[1].id, events[0].id);
  assert.deepEqual(events[1].style, { backgroundColor: "#FEE2E2", color: "#991B1B" });
  assert.equal(await run({ action: () => undefined, errorLabel: "Save failed." }), undefined);
  assert.equal(events.at(-1).message, "Save failed.");
  assert.equal(events.filter(e => e.type === "success").length, 0);
});

test("synchronous throws and rejected actions clear loading and preserve the rejection", async () => {
  for (const asynchronous of [false, true]) {
    const { run, events } = harness();
    const error = new Error("Private backend detail");
    const action = asynchronous ? async () => { throw error; } : () => { throw error; };
    await assert.rejects(run({ action, errorLabel: "Could not save. Try again." }), actual => actual === error);
    assert.deepEqual(events.map(e => e.type), ["loading", "error"]);
    assert.equal(events[1].id, events[0].id);
    assert.equal(events[1].message, "Could not save. Try again.");
  }
});

test("an unlabeled thrown failure gets safe feedback instead of exposing its message", async () => {
  const { run, events } = harness();
  await assert.rejects(run({ action: () => { throw new Error("Database secret"); } }));
  assert.equal(events[1].message, "Something went wrong. Please try again.");
});

test("concurrent actions each resolve their own loading toast without early success", async () => {
  const { run, events } = harness();
  let resolveFirst, resolveSecond;
  const first = run({ action: () => new Promise(resolve => { resolveFirst = resolve; }), successLabel: "First saved." });
  const second = run({ action: () => new Promise(resolve => { resolveSecond = resolve; }), successLabel: "Second saved." });
  assert.deepEqual(events.map(e => e.type), ["loading", "loading"]);
  resolveSecond({ success: true });
  await second;
  assert.equal(events.at(-1).id, events[1].id);
  assert.equal(events.at(-1).message, "Second saved.");
  resolveFirst({ success: true });
  await first;
  assert.equal(events.at(-1).id, events[0].id);
  assert.equal(events.at(-1).message, "First saved.");
});

test("an opted-in stalled upload replaces its loading toast and does not report late success", async () => {
  const { run, events } = harness(); let resolve;
  const result = await run({ action: () => new Promise(done => { resolve = done; }), timeoutMs: 5, timeoutLabel: "Upload was not confirmed. Refresh first." });
  assert.equal(result.success, false); assert.equal(result.timedOut, true);
  assert.deepEqual(events.map(event => event.type), ["loading", "error"]);
  assert.equal(events[0].id, events[1].id); assert.match(events[1].message, /Refresh first/);
  resolve({ success: true }); await Promise.resolve(); await Promise.resolve();
  assert.equal(events.length, 2);
});

test("a rejection after the upload deadline does not replace the timeout with another toast", async () => {
  const { run, events } = harness(); let reject;
  await run({ action: () => new Promise((_, fail) => { reject = fail; }), timeoutMs: 5 });
  reject(new Error("Late transport failure")); await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(events.map(event => event.type), ["loading", "error"]);
});

test("a returned upload error before the deadline retains its real message and has no late timeout", async () => {
  const { run, events } = harness();
  await run({ action: async () => ({ success: false, error: "File exceeds the upload limit." }), timeoutMs: 5 });
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(events.length, 2); assert.equal(events[1].message, "File exceeds the upload limit.");
});
