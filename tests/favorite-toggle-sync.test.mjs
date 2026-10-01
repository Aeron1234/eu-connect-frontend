import assert from "node:assert/strict";
import { test } from "node:test";
import { reconcileFavoriteToggle } from "../lib/favorite-toggle-sync.mjs";

function deferred() {
  let resolve;
  const promise = new Promise((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

test("rapid clicks are reconciled with one favorite toggle in flight", async () => {
  let desired = true;
  let confirmed = false;
  let active = 0;
  let maxActive = 0;
  const first = deferred();
  const second = deferred();
  const replies = [first, second];
  let calls = 0;

  const sync = reconcileFavoriteToggle({
    getDesired: () => desired,
    getConfirmed: () => confirmed,
    toggle: async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      const reply = replies[calls++];
      const result = await reply.promise;
      active -= 1;
      return result;
    },
    onConfirmed: (value) => {
      confirmed = value;
    },
    onFailure: () => assert.fail("unexpected failure"),
  });

  assert.equal(calls, 1);
  desired = false; // The user changed their mind before the first response.
  first.resolve({ success: true, isFavorited: true });
  await first.promise;
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 2);
  assert.equal(maxActive, 1);

  second.resolve({ success: true, isFavorited: false });
  await sync;
  assert.equal(confirmed, false);
  assert.equal(calls, 2);
});

test("a canceled desired change sends no request", async () => {
  let calls = 0;
  await reconcileFavoriteToggle({
    getDesired: () => false,
    getConfirmed: () => false,
    toggle: () => {
      calls += 1;
    },
    onConfirmed: () => {},
    onFailure: () => {},
  });
  assert.equal(calls, 0);
});

test("failed toggles can restore the last confirmed state", async () => {
  let desired = true;
  const confirmed = false;
  let failures = 0;
  await reconcileFavoriteToggle({
    getDesired: () => desired,
    getConfirmed: () => confirmed,
    toggle: async () => ({ success: false, error: "Try again." }),
    onConfirmed: () => assert.fail("unexpected success"),
    onFailure: () => {
      failures += 1;
      desired = confirmed;
    },
  });
  assert.equal(desired, false);
  assert.equal(failures, 1);
});

test("a drifting server response cannot cause an unbounded toggle loop", async () => {
  let calls = 0;
  let failures = 0;
  await reconcileFavoriteToggle({
    getDesired: () => true,
    getConfirmed: () => false,
    toggle: async () => {
      calls += 1;
      return { success: true, isFavorited: false };
    },
    onConfirmed: () => {},
    onFailure: () => {
      failures += 1;
    },
  });
  assert.equal(calls, 4);
  assert.equal(failures, 1);
});
