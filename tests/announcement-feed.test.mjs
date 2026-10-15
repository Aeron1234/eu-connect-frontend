import assert from "node:assert/strict";
import { test } from "node:test";
import { getAnnouncementFeed } from "../lib/announcement-feed.mjs";

const row = (id) => Object.freeze({ id });
const page = (pinned, regular) => Object.freeze({
  pinned: Object.freeze(pinned),
  regular: Object.freeze(regular),
});

test("a linked regular announcement retains its position below every pinned card", () => {
  const pages = [page([row("pinned-new"), row("pinned-old")], [row("new"), row("target"), row("old")])];
  const normal = getAnnouncementFeed(pages);
  const linked = getAnnouncementFeed(pages, "target");

  assert.deepEqual(linked.pinned, normal.pinned);
  assert.deepEqual(linked.regular, normal.regular);
  assert.deepEqual([...linked.pinned, ...linked.regular].map((item) => item.id), [
    "pinned-new", "pinned-old", "new", "target", "old",
  ]);
  assert.equal(linked.hasTarget, true);
});

test("a linked pinned announcement stays in its original pinned position", () => {
  const pages = [page([row("new-pinned"), row("target"), row("old-pinned")], [row("regular")])];
  const feed = getAnnouncementFeed(pages, "target");

  assert.deepEqual(feed.pinned.map((item) => item.id), ["new-pinned", "target", "old-pinned"]);
  assert.deepEqual(feed.regular.map((item) => item.id), ["regular"]);
  assert.equal(feed.hasTarget, true);
});

test("a target on a later page appears only after all its preceding rows are loaded", () => {
  const pages = [
    page([row("pinned")], [row("new"), row("middle")]),
    page([row("pinned")], [row("older"), row("target"), row("oldest")]),
  ];
  assert.equal(getAnnouncementFeed(pages.slice(0, 1), "target").hasTarget, false);

  const feed = getAnnouncementFeed(pages, "target");
  assert.deepEqual([...feed.pinned, ...feed.regular].map((item) => item.id), [
    "pinned", "new", "middle", "older", "target", "oldest",
  ]);
  assert.equal(feed.hasTarget, true);
});

test("overlapping pages and a newly pinned row cannot duplicate a linked card", () => {
  const pages = [
    page([row("target")], [row("new")]),
    page([], [row("new"), row("target"), row("old"), row("old")]),
  ];
  const feed = getAnnouncementFeed(pages, "target");

  assert.deepEqual([...feed.pinned, ...feed.regular].map((item) => item.id), ["target", "new", "old"]);
  assert.equal(feed.hasTarget, true);
});

test("missing targets never create a separate card or change feed order", () => {
  const pages = [page([row("pinned")], [row("regular")])];
  const feed = getAnnouncementFeed(pages, "deleted");

  assert.deepEqual(feed.pinned, pages[0].pinned);
  assert.deepEqual(feed.regular, pages[0].regular);
  assert.equal(feed.hasTarget, false);
});

test("numeric and string row IDs are deduplicated without changing the original rows", () => {
  const pages = [page([row(1)], [row("1"), row(2), row("2"), row(3)])];
  const feed = getAnnouncementFeed(pages, "2");

  assert.deepEqual(feed.pinned, [row(1)]);
  assert.deepEqual(feed.regular, [row(2), row(3)]);
  assert.equal(feed.hasTarget, true);
  assert.equal(pages[0].regular.length, 4);
});

test("a pending or empty feed has no synthetic selected announcement", () => {
  assert.deepEqual(getAnnouncementFeed(undefined, "target"), { pinned: [], regular: [], hasTarget: false });
  assert.deepEqual(getAnnouncementFeed([page([], [])]), { pinned: [], regular: [], hasTarget: false });
});
