import assert from "node:assert/strict";
import { test } from "node:test";
import { removeErrorGroupFromResult } from "../lib/error-tracking-results.mjs";

function result(overrides = {}) {
  return {
    data: [{ fingerprint: "first", occurrences: 3 }, { fingerprint: "second", occurrences: 2 }],
    stats: { totalGroups: 16, totalOccurrences: 50 },
    pagination: { page: 1, limit: 15, total: 16, totalPages: 2 },
    ...overrides,
  };
}

test("confirmed deletions update rows, group counts and occurrences without mutating cached results", () => {
  const before = result();
  const after = removeErrorGroupFromResult(before, "first");
  assert.deepEqual(after.data, [{ fingerprint: "second", occurrences: 2 }]);
  assert.deepEqual(after.stats, { totalGroups: 15, totalOccurrences: 47 });
  assert.deepEqual(after.pagination, { page: 1, limit: 15, total: 15, totalPages: 1 });
  assert.equal(before.data.length, 2);
  assert.equal(before.stats.totalOccurrences, 50);
});

test("counts use the occurrences in each filtered view instead of all-time deletion totals", () => {
  const lastDay = result({ data: [{ fingerprint: "first", occurrences: 1 }] });
  const lastMonth = result({ data: [{ fingerprint: "first", occurrences: 12 }] });
  assert.equal(removeErrorGroupFromResult(lastDay, "first").stats.totalOccurrences, 49);
  assert.equal(removeErrorGroupFromResult(lastMonth, "first").stats.totalOccurrences, 38);
});

test("removing the last group on a later page supplies a valid preceding page bound", () => {
  const after = removeErrorGroupFromResult(result({
    data: [{ fingerprint: "first", occurrences: 3 }],
    pagination: { page: 2, limit: 15, total: 16, totalPages: 2 },
  }), "first");
  assert.deepEqual(after.data, []);
  assert.equal(after.pagination.totalPages, 1);
  assert.equal(Math.max(1, after.pagination.totalPages), 1);
  const empty = removeErrorGroupFromResult(result({
    data: [{ fingerprint: "first", occurrences: 3 }],
    stats: { totalGroups: 1, totalOccurrences: 3 },
    pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
  }), "first");
  assert.deepEqual(empty.stats, { totalGroups: 0, totalOccurrences: 0 });
  assert.equal(empty.pagination.totalPages, 0);
});

test("unaffected pages, unloaded queries and repeated removals retain their cached values", () => {
  const before = result();
  assert.equal(removeErrorGroupFromResult(before, "missing"), before);
  for (const value of [undefined, null, {}, { data: [] }]) assert.equal(removeErrorGroupFromResult(value, "first"), value);
  const deleted = removeErrorGroupFromResult(before, "first");
  assert.equal(removeErrorGroupFromResult(deleted, "first"), deleted);
});
