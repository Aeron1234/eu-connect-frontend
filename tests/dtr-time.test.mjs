import assert from "node:assert/strict";
import test from "node:test";
import { formatDtrDate, formatDtrTime } from "../lib/dtr-time.mjs";

test("DTR times use Manila time on the server", () => {
  assert.equal(formatDtrTime("2026-10-05T01:01:00.000Z"), "9:01 AM");
  assert.equal(formatDtrTime("2026-10-05T09:42:00.000Z"), "5:42 PM");
});

test("the Today heading uses the Manila calendar date", () => {
  assert.equal(
    formatDtrDate("2026-10-04T16:30:00.000Z"),
    "Monday, October 5, 2026",
  );
});

test("missing or invalid DTR times show a placeholder", () => {
  assert.equal(formatDtrTime(null), "—");
  assert.equal(formatDtrTime("not-a-date"), "—");
});
