import { test } from "node:test";
import assert from "node:assert/strict";
import { getNotificationTargetPath } from "../lib/notification-routes.js";

test("student approval notifications open My Records for socket payloads and read/unread inbox items", () => {
  for (const payload of [{}, { link_uuid: "internship-id", is_read: false }, { link_uuid: "internship-id", is_read: true }, { link: "legacy-record" }]) {
    assert.equal(getNotificationTargetPath({ ...payload, type: "internship_record_approved" }), "/student/internship-record");
  }
});

test("department-head evaluation notifications navigate to the internship record instead of the evaluation UUID", () => {
  for (const is_read of [true, false]) {
    assert.equal(getNotificationTargetPath({ type: "evaluation_submitted", link: "internship-uuid", link_uuid: "evaluation-uuid", is_read }), "/internship-records/internship-uuid");
  }
  assert.equal(getNotificationTargetPath({ type: "evaluation_submitted", link_uuid: "evaluation-uuid" }), null);
  assert.equal(getNotificationTargetPath({ type: "evaluation_submitted", link: "record/unsafe?" }), "/internship-records/record%2Funsafe%3F");
});

test("finished internship notifications open their record for both unread and read items", () => {
  const internshipId = "e531092e-4d22-4e1b-b909-e89d2c6ac3ea";
  for (const is_read of [false, true]) {
    assert.equal(
      getNotificationTargetPath({ type: "internship_record_finished", link_uuid: internshipId, is_read }),
      `/internship-records/${internshipId}`,
    );
    assert.equal(
      getNotificationTargetPath({ type: "internship_record_finished", link: internshipId, is_read }),
      `/internship-records/${internshipId}`,
    );
  }
});

test("finished internship links prefer the UUID field and require a record ID", () => {
  assert.equal(
    getNotificationTargetPath({ type: "internship_record_finished", link_uuid: "current-record", link: "old-record" }),
    "/internship-records/current-record",
  );
  for (const item of [{}, { link: null, link_uuid: null }, { link: "", link_uuid: "" }]) {
    assert.equal(getNotificationTargetPath({ ...item, type: "internship_record_finished" }), null);
  }
  assert.equal(
    getNotificationTargetPath({ type: "internship_record_finished", link_uuid: "record/id?tab=dtr" }),
    "/internship-records/record%2Fid%3Ftab%3Ddtr",
  );
});

test("employer certificate decisions open the student's Certificates tab", () => {
  for (const type of ["certificate_accepted", "certificate_rejected"]) {
    assert.equal(
      getNotificationTargetPath({ type, link_uuid: "student-id" }),
      "/users/student-id?tab=certificates",
    );
    assert.equal(getNotificationTargetPath({ type }), null);
  }
  assert.equal(getNotificationTargetPath({ type: "certificate_uploaded" }), "/student/storage");
});
