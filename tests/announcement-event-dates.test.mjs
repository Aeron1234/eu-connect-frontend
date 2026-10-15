import test from "node:test";
import assert from "node:assert/strict";
import { formatCompactEventDateRange, formatEventDateRange } from "../lib/announcement-event-dates.mjs";
import { entriesFor } from "../components/calendar-ui/calendarEntries.js";

test("announcement dates render single days and complete ranges without timezone shifts", () => {
  assert.equal(formatEventDateRange(null, null), "");
  assert.equal(formatEventDateRange("2026-10-16", null), "Oct 16, 2026");
  assert.equal(formatEventDateRange("2026-10-16", "2026-10-16"), "Oct 16, 2026");
  assert.equal(formatEventDateRange("2026-10-30", "2026-11-02"), "Oct 30, 2026 – Nov 2, 2026");
  assert.equal(formatEventDateRange("2026-12-31", "2027-01-02"), "Dec 31, 2026 – Jan 2, 2027");
  assert.equal(formatEventDateRange("2026-10-16T00:00:00.000Z", null, "MMMM d, yyyy"), "October 16, 2026");
});

test("compact mobile date ranges avoid repeating the month and year unnecessarily", () => {
  assert.equal(formatCompactEventDateRange(null, null), "");
  assert.equal(formatCompactEventDateRange("2026-10-27", null), "Oct 27, 2026");
  assert.equal(formatCompactEventDateRange("2026-10-27", "2026-10-27"), "Oct 27, 2026");
  assert.equal(formatCompactEventDateRange("2026-10-27", "2026-10-30"), "Oct 27 – 30, 2026");
  assert.equal(formatCompactEventDateRange("2026-10-30", "2026-11-02"), "Oct 30 – Nov 2, 2026");
  assert.equal(formatCompactEventDateRange("2026-12-31", "2027-01-02"), "Dec 31, 2026 – Jan 2, 2027");
});

test("multi-day announcements include both endpoints and continue across month boundaries", () => {
  const announcement = {
    id: "public-id",
    title: "School event",
    content: "Event details",
    category: "General",
    event_date: "2026-10-30",
    event_end_date: "2026-11-02",
  };
  const data = { announcements: [announcement] };
  for (const [day, position] of [
    ["2026-10-30", "start"], ["2026-10-31", "middle"],
    ["2026-11-01", "middle"], ["2026-11-02", "end"],
  ]) {
    const entries = entriesFor(data, day);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].rangePosition, position);
    assert.equal(entries[0].rangeLabel, "Oct 30, 2026 – Nov 2, 2026");
    assert.equal(entries[0].href, "/announcements?announcement=public-id");
  }
  assert.deepEqual(entriesFor(data, "2026-10-29"), []);
  assert.deepEqual(entriesFor(data, "2026-11-03"), []);
});

test("existing announcements without an until date stay single-day events", () => {
  for (const event_end_date of [undefined, null, "", "2026-10-16"]) {
    const data = { announcements: [{ id: "one", title: "One day", event_date: "2026-10-16", event_end_date }] };
    const entry = entriesFor(data, "2026-10-16")[0];
    assert.equal(entry.rangePosition, "single");
    assert.equal(entry.rangeLabel, "Oct 16, 2026");
    assert.deepEqual(entriesFor(data, "2026-10-17"), []);
  }
  assert.deepEqual(entriesFor({ announcements: [{ id: "no-date", event_date: null, event_end_date: null }] }, "2026-10-16"), []);
});

test("schedules show the same range information without changing private to-dos or internship markers", () => {
  const schedule = { id: 9, title: "Deadline", starts_on: "2026-10-16", ends_on: "2026-10-18", department_id: null };
  const todo = { id: 3, todo_date: "2026-10-17", title: "My task", is_done: 1 };
  const data = {
    schedules: [schedule],
    internship: { company_name: "Company", date_started: "2026-10-01", date_ended: "2026-10-31" },
    todos: [todo],
  };
  const entries = entriesFor(data, "2026-10-17");
  assert.deepEqual(entries.map((entry) => entry.kind), ["schedule", "internship", "todo"]);
  assert.equal(entries[0].rangeLabel, "Oct 16, 2026 – Oct 18, 2026");
  assert.equal(entries[0].rangePosition, "middle");
  assert.equal(entries[0].source, schedule);
  assert.equal(entries[2].source, todo);
  assert.equal(entries[2].done, true);
});
