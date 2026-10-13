import { test } from "node:test";
import assert from "node:assert/strict";
import { getNotificationTargetPath } from "../lib/notification-routes.js";

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
