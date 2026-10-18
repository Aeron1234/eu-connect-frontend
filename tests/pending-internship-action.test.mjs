import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { parseApiResponse } from "../lib/api-response.js";

const source = readFileSync(new URL("../lib/server-actions/internship-records-actions.js", import.meta.url), "utf8");
const start = source.indexOf("export async function updateOwnPendingInternshipRecord(");
const end = source.indexOf("\nexport async function deleteOwnInternshipRecord(", start);
assert.ok(start >= 0 && end > start);

function harness({ token = "test-token", status = 200, payload = { success: true, record: { id: "record-1", status: "pending" } }, fail = false } = {}) {
  const requests = [], invalidated = [];
  const update = vm.runInNewContext(source.slice(start, end).replace("export ", "") + "\nupdateOwnPendingInternshipRecord;", {
    getAccessToken: async () => token,
    getApiBaseUrl: () => "https://example.test/api/v1",
    revalidatePath: (path) => invalidated.push(path),
    parseApiResponse,
    console: { error() {} },
    fetch: async (url, options) => {
      requests.push({ url, ...options });
      if (fail) throw new Error("offline");
      return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
    },
  });
  return { update, requests, invalidated };
}

test("pending edit forwards the existing ID and FormData to the versioned PATCH endpoint", async () => {
  const { update, requests, invalidated } = harness();
  const form = new FormData(); form.set("company_name", "Updated company");
  const result = await update("record/one", form);
  assert.equal(result.success, true); assert.equal(result.record.id, "record-1");
  assert.equal(requests[0].url, "https://example.test/api/v1/internship-records/mine/record%2Fone");
  assert.equal(requests[0].method, "PATCH"); assert.equal(requests[0].body, form);
  assert.equal(requests[0].headers.Authorization, "Bearer test-token");
  assert.deepEqual(invalidated, ["/student/internship-record"]);
});

test("an approval conflict or deletion asks the form to refresh its current record", async () => {
  for (const status of [409, 404]) {
    const { update, invalidated } = harness({ status, payload: { error: "Record changed." } });
    const result = await update("record-1", new FormData());
    assert.equal(result.success, false); assert.equal(result.refreshRecord, true);
    assert.deepEqual(invalidated, ["/student/internship-record"]);
  }
});

test("validation and network failures preserve the edit instead of claiming success", async () => {
  for (const options of [{ status: 400, payload: { error: "Invalid dates." } }, { fail: true }]) {
    const { update, invalidated } = harness(options);
    const result = await update("record-1", new FormData());
    assert.equal(result.success, false); assert.ok(!result.refreshRecord);
    assert.deepEqual(invalidated, []);
  }
});

test("missing authentication or record ID never sends an update request", async () => {
  const signedOut = harness({ token: null });
  assert.equal((await signedOut.update("record-1", new FormData())).success, false);
  assert.equal(signedOut.requests.length, 0);
  const missingId = harness();
  assert.equal((await missingId.update("", new FormData())).success, false);
  assert.equal(missingId.requests.length, 0);
});
