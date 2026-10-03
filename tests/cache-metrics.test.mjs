import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveCacheView } from "../lib/cache-metrics.mjs";

test("cache metrics compare only snapshots from the same process", () => {
  const previous = {
    startedAt: "process-a", totals: { hit: 10, miss: 5, store: 4 },
    routes: [{ route: "/notifications", hit: 6, miss: 4, store: 3 }],
  };
  const current = {
    startedAt: "process-a", totals: { hit: 18, miss: 7, store: 5 },
    routes: [
      { route: "/notifications", hit: 11, miss: 5, store: 4 },
      { route: "/announcements/history", hit: 2, miss: 1, store: 1 },
    ],
  };
  const interval = deriveCacheView(current, previous);
  assert.equal(interval.interval, true);
  assert.equal(interval.totals.hit, 8);
  assert.equal(interval.totals.miss, 2);
  assert.equal(interval.totals.hitRate, 0.8);
  assert.equal(interval.routes[0].hit, 5);
  assert.equal(interval.routes[1].miss, 1);

  const restarted = deriveCacheView({ ...current, startedAt: "process-b" }, previous);
  assert.equal(restarted.interval, false);
  assert.equal(restarted.processChanged, true);
  assert.equal(restarted.totals.hit, 18);
  assert.equal(restarted.routes[0].hit, 11);
});

test("empty lookup intervals show no rate and counters never become negative", () => {
  const view = deriveCacheView(
    { startedAt: "same", totals: { hit: 4, miss: 3 }, routes: [] },
    { startedAt: "same", totals: { hit: 5, miss: 4 }, routes: [] },
  );
  assert.equal(view.totals.lookups, 0);
  assert.equal(view.totals.hitRate, null);
  assert.equal(view.totals.hit, 0);
  assert.equal(view.totals.miss, 0);
});
