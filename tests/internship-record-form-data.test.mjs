import test from "node:test";
import assert from "node:assert/strict";
import { getCurrentInternshipRecord, internshipRecordFields } from "../components/internship-records-ui/internshipRecordFormData.mjs";

test("current record uses full active data and merges list-only details for the same ID", () => {
  const records = [
    { id: "newer", status: "pending", company_name: "Another company" },
    { id: "12", status: "pending", company_name: "Old name", supervisor_name: "Supervisor" },
  ];
  const current = getCurrentInternshipRecord(records, { id: 12, status: "ongoing", company_name: "Current company", semester: "2nd", region_id: 4 });
  assert.equal(current.company_name, "Current company");
  assert.equal(current.status, "ongoing");
  assert.equal(current.semester, "2nd");
  assert.equal(current.region_id, 4);
  assert.equal(current.supervisor_name, "Supervisor");
  assert.equal(records[1].company_name, "Old name");
});

test("only pending and ongoing records are current, with ongoing preferred in fallback data", () => {
  const records = [{ id: 1, status: "finished" }, { id: 2, status: "rejected" }, { id: 3, status: "pending" }, { id: 4, status: "ongoing" }];
  assert.equal(getCurrentInternshipRecord(records).id, 4);
  assert.equal(getCurrentInternshipRecord(records.slice(0, 3)).id, 3);
  assert.equal(getCurrentInternshipRecord(records.slice(0, 2)), null);
  assert.equal(getCurrentInternshipRecord([], { status: "finished" }), null);
  assert.equal(getCurrentInternshipRecord(), null);
});

test("confirmed submission details remain visible before the server refetch completes", () => {
  const submitted = { company_name: "New placement", company_address: "Lucena", semester: "1st", region_id: "4", total_hours: 200, status: "pending" };
  const current = getCurrentInternshipRecord([{ id: 1, status: "finished", company_name: "Previous placement" }], submitted);
  assert.equal(current.company_name, "New placement");
  assert.equal(current.status, "pending");
  assert.equal(internshipRecordFields(current).total_hours, 200);
});

test("saved dates use Philippine calendar dates and nullable fields stay valid controlled values", () => {
  const fields = internshipRecordFields({ date_started: "2026-10-17T16:00:00.000Z", date_ended: "2026-12-31", company_website: null, description: null, lat: 0, lon: 0, total_hours: 0 });
  assert.equal(fields.date_started, "2026-10-18");
  assert.equal(fields.date_ended, "2026-12-31");
  assert.equal(fields.company_website, "");
  assert.equal(fields.description, "");
  assert.equal(fields.lat, 0);
  assert.equal(fields.lon, 0);
  assert.equal(fields.total_hours, 0);
  assert.equal(internshipRecordFields({ date_started: "invalid" }).date_started, "");
  assert.ok(Object.values(internshipRecordFields()).every((value) => value === ""));
});
