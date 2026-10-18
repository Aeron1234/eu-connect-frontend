import assert from "node:assert/strict";
import { test } from "node:test";
import { canActuallyApprove, canActuallyDelete } from "../components/internship-docs-ui/documentPermissions.js";

const document = {
  user_id: "student-owner",
  uploaded_by_id: "employer-uploader",
  uploaded_by_role: "employer",
  verification_status: "pending",
};
const student = { userRole: "student", currentUserId: "student-owner" };

test("students can delete all their own files, including accepted employer uploads", () => {
  for (const uploaded_by_role of ["student", "employer"]) {
    for (const verification_status of [null, "pending", "accepted"]) {
      assert.equal(canActuallyDelete({
        ...student, canDelete: false, item: { ...document, uploaded_by_role, verification_status },
      }), true);
    }
  }
});

test("student permissions require document ownership, regardless of who uploaded it", () => {
  for (const currentUserId of ["another-student", "employer-uploader", undefined, ""]) {
    assert.equal(canActuallyDelete({ ...student, currentUserId, canDelete: true, item: document }), false);
    assert.equal(canActuallyApprove({ ...student, currentUserId, canApprove: true, item: document }), false);
  }
  assert.equal(canActuallyDelete({ ...student, item: { ...document, user_id: undefined } }), false);
  assert.equal(canActuallyDelete({ ...student, currentUserId: "42", item: { ...document, user_id: 42 } }), true);
});

test("only pending employer documents owned by the student can be accepted", () => {
  const options = { ...student, canApprove: true, item: document };
  assert.equal(canActuallyApprove(options), true);
  for (const changed of [
    { canApprove: false },
    { userRole: "admin" },
    { userRole: "employer" },
    { item: { ...document, uploaded_by_role: "student" } },
    { item: { ...document, verification_status: "accepted" } },
    { item: { ...document, verification_status: null } },
  ]) assert.equal(canActuallyApprove({ ...options, ...changed }), false);
  // Acceptance immediately exposes deletion while removing the accept action.
  const accepted = { ...options, item: { ...document, verification_status: "accepted" } };
  assert.equal(canActuallyApprove(accepted), false);
  assert.equal(canActuallyDelete(accepted), true);
});

test("employer and staff deletion permissions retain their existing restrictions", () => {
  const employer = { userRole: "employer", currentUserId: "employer-uploader", canDelete: true };
  assert.equal(canActuallyDelete({ ...employer, item: document }), true);
  assert.equal(canActuallyDelete({ ...employer, currentUserId: "other-employer", item: document }), false);
  assert.equal(canActuallyDelete({ ...employer, item: { ...document, verification_status: "accepted" } }), false);
  const accepted = { ...document, verification_status: "accepted" };
  assert.equal(canActuallyDelete({ userRole: "admin", canDelete: true, item: accepted }), true);
  assert.equal(canActuallyDelete({ userRole: "department_head", canDelete: true, item: accepted }), false);
});
