import { test } from "node:test";
import assert from "node:assert/strict";
import { departmentRecordDestination } from "../lib/department-record-navigation.js";

test("old record review tabs redirect to their focused department-head pages", () => {
  const id = "record-id";
  assert.equal(departmentRecordDestination(id, { tab: "dtr" }), "/department_head/attendance/record-id");
  for (const tab of ["narratives", "summary-report", "documents"]) {
    assert.equal(departmentRecordDestination(id, { tab }), `/department_head/submissions/record-id?tab=${tab}`);
  }
  assert.equal(departmentRecordDestination(id, { tab: "evaluations", evaluationId: "evaluation-id" }), "/department_head/evaluations/record-id?evaluationId=evaluation-id");
  assert.equal(departmentRecordDestination(id, { tab: "rotations" }), "/department_head/internship-records/record-id?tab=rotations");
});
