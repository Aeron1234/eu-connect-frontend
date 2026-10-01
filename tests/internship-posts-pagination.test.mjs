import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canKeepLoadedPostingPages,
  pageAfterPostingRefresh,
  reconcilePostingPageOne,
} from "../lib/internship-posts-pagination.mjs";

test("favoriting a post keeps loaded pages and the next See more page", () => {
  const firstPage = Array.from({ length: 10 }, (_, index) => ({
    id: `post-${index + 1}`,
    isFavorited: false,
  }));
  const secondPage = Array.from({ length: 10 }, (_, index) => ({
    id: `post-${index + 11}`,
    isFavorited: false,
  }));
  const visible = [...firstPage, ...secondPage];
  const refreshedFirstPage = firstPage.map((post) =>
    post.id === "post-3" ? { ...post, isFavorited: true } : post,
  );

  const keepLoadedPages = canKeepLoadedPostingPages(
    firstPage.map((post) => post.id),
    30,
    refreshedFirstPage,
    30,
  );
  const refreshedVisible = reconcilePostingPageOne(
    visible,
    refreshedFirstPage,
    keepLoadedPages,
  );

  assert.equal(keepLoadedPages, true);
  assert.equal(pageAfterPostingRefresh(2, keepLoadedPages), 2);
  assert.equal(pageAfterPostingRefresh(2, keepLoadedPages) + 1, 3);
  assert.equal(refreshedVisible.length, 20);
  assert.equal(refreshedVisible[2].isFavorited, true);
  assert.equal(refreshedVisible[19].id, "post-20");
});

test("changed page boundaries reset to the new first page", () => {
  const previousIds = ["post-1", "post-2"];
  const visible = [{ id: "post-1" }, { id: "post-2" }, { id: "post-3" }];
  const nextPageOne = [{ id: "new-post" }, { id: "post-1" }];
  const keepLoadedPages = canKeepLoadedPostingPages(
    previousIds,
    3,
    nextPageOne,
    3,
  );

  assert.equal(keepLoadedPages, false);
  assert.equal(pageAfterPostingRefresh(2, keepLoadedPages), 1);
  assert.deepEqual(
    reconcilePostingPageOne(visible, nextPageOne, keepLoadedPages),
    nextPageOne,
  );
});
