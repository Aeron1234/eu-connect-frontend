import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canKeepLoadedPages,
  hasValidPage,
  pageAfterRefresh,
  reconcilePageOne,
} from "../lib/see-more-pagination.mjs";

test("stable first page refreshes rows without replaying an already loaded page", () => {
  const visible = [
    { id: 1, read: false },
    { id: 2, read: false },
    { id: 3, read: false },
  ];
  const freshFirstPage = [{ id: 1, read: true }, { id: 2, read: false }];
  const keep = canKeepLoadedPages([1, 2], 3, freshFirstPage, 3);

  assert.equal(keep, true);
  assert.deepEqual(reconcilePageOne(visible, freshFirstPage, keep), [
    freshFirstPage[0], freshFirstPage[1], visible[2],
  ]);
  assert.equal(pageAfterRefresh(2, keep) + 1, 3);
});

test("changed first-page membership resets later pages, including company keys", () => {
  const keyOf = (company) => company.company_name.trim().toLowerCase();
  const nextPage = [{ company_name: "New Company" }, { company_name: "Acme" }];
  const keep = canKeepLoadedPages(["acme", "beta"], 3, nextPage, 3, keyOf);

  assert.equal(keep, false);
  assert.deepEqual(reconcilePageOne([{ company_name: "Beta" }], nextPage, keep, keyOf), nextPage);
  assert.equal(pageAfterRefresh(2, keep), 1);
});

test("an error or malformed page cannot be treated as a successful empty page", () => {
  assert.equal(hasValidPage(null, "data"), false);
  assert.equal(hasValidPage({ error: "Unavailable" }, "data"), false);
  assert.equal(hasValidPage({ data: [], pagination: { totalPages: 0 } }, "data"), true);
  assert.equal(hasValidPage({ data: [], totalPages: 2 }, "data", null), true);
  assert.equal(hasValidPage({ data: [], totalPages: "2" }, "data", null), false);
  assert.equal(hasValidPage({ data: [{ id: 1 }], pagination: { page: 1, totalPages: 3 } }, "data", "pagination", 2), false);
  assert.equal(hasValidPage({ data: [{ id: 2 }], currentPage: 2, totalPages: 3 }, "data", null, 2), true);
});
