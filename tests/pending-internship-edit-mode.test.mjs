import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { internshipRecordFields } from "../components/internship-records-ui/internshipRecordFormData.mjs";

const hookSource = readFileSync(new URL("../components/internship-records-ui/useInternshipRecordForm.js", import.meta.url), "utf8")
  .replace(/^import .*;\r?$/gm, "")
  .replace("export default function useInternshipRecordForm", "function useInternshipRecordForm");

const original = {
  id: "record-1", status: "pending", company_name: "Saved Company", company_address: "Lucena City",
  internship_position: "Developer intern", company_website: null, description: "Saved activities",
  date_started: "2026-10-17T16:00:00.000Z", date_ended: "2026-12-31", total_hours: 200,
  semester: "1st", region_id: 4, lat: 13.94, lon: 121.61,
};

function harness(record = original) {
  let activeRecord = record && { ...record };
  let currentStatus = record?.status || "";
  let index = 0, pending = false, response = { success: false }, conflicts = 0;
  const states = [], tasks = [], calls = [], updated = [], created = [];
  const hook = vm.runInNewContext(hookSource + "\nuseInternshipRecordForm;", {
    internshipRecordFields,
    useState(initial) {
      const slot = index++;
      if (!(slot in states)) states[slot] = typeof initial === "function" ? initial() : initial;
      return [states[slot], (value) => { states[slot] = typeof value === "function" ? value(states[slot]) : value; }];
    },
    useTransition: () => [pending, (callback) => tasks.push(Promise.resolve(callback()))],
    toastAndAction: ({ action, args }) => action(...args),
    createInternshipRecord: async (...args) => { calls.push({ type: "create", args }); return response; },
    updateOwnPendingInternshipRecord: async (...args) => { calls.push({ type: "update", args }); return response; },
  });
  return {
    render() {
      index = 0;
      return hook({ recordStatus: currentStatus, activeRecord,
        onUpdated(value) { updated.push(value); activeRecord = value; },
        onCreated(value) { created.push(value); }, onConflict() { conflicts += 1; },
      });
    },
    setRecord(value) { activeRecord = value; currentStatus = value?.status || ""; },
    setResponse(value) { response = value; },
    setPending(value) { pending = value; },
    get conflicts() { return conflicts; }, calls, updated, created,
    async settle() { await Promise.all(tasks.splice(0)); },
  };
}


test("pending records are immediately editable with saved data", () => {
  const h = harness(), form = h.render();
  assert.equal(form.status, false); assert.equal(form.isEditing, true);
  assert.equal(form.fieldProps.internshipForm.company_name, "Saved Company");
  assert.equal(form.fieldProps.internshipForm.date_started, "2026-10-18");
  assert.equal(form.regionProps.selectedRegion, "4");
  assert.equal(h.calls.length, 0);
});

test("pending drafts and live location remain editable without an Edit toggle", () => {
  const h = harness(); let form = h.render();
  form.fieldProps.setInternshipForm((previous) => ({ ...previous, company_name: "Unsaved Company", company_address: "New address", lat: 14, lon: 122 }));
  form.regionProps.setSelectedRegion("5"); form = h.render();
  assert.equal(form.status, false); assert.equal(form.fieldProps.internshipForm.company_name, "Unsaved Company");
  assert.equal(form.fieldProps.internshipForm.lat, 14); assert.equal(form.regionProps.selectedRegion, "5");
  assert.equal(original.company_name, "Saved Company"); assert.equal(h.calls.length, 0);
  assert.equal(form.startEditing, undefined); assert.equal(form.cancelEditing, undefined);
});

test("Save updates the same pending record and keeps its fields populated and editable", async () => {
  const h = harness(); let form = h.render();
  form.fieldProps.setInternshipForm((previous) => ({ ...previous, company_name: "Updated Company", company_address: "Updated address", lat: 14, lon: 122 }));
  form.regionProps.setSelectedRegion("5"); form = h.render();
  h.setResponse({ success: true, record: { ...original, company_name: "Updated Company", company_address: "Updated address", lat: 14, lon: 122, region_id: 5 } });
  const payload = new FormData(); payload.set("region_id", "5");
  form.handleAction(payload); await h.settle();
  assert.equal(h.calls[0].type, "update"); assert.equal(h.calls[0].args[0], "record-1");
  assert.equal(h.calls[0].args[1], payload); assert.equal(payload.get("lat"), "14");
  assert.equal(payload.get("company_address"), "Updated address");
  form = h.render(); assert.equal(form.status, false); assert.equal(form.isEditing, true);
  assert.equal(form.fieldProps.internshipForm.company_name, "Updated Company");
  assert.equal(form.regionProps.selectedRegion, "5");
  assert.equal(h.updated.length, 1); assert.equal(h.created.length, 0);
});

test("failed saves preserve drafts and approval switches to the locked saved record", async () => {
  const h = harness(); let form = h.render();
  form.fieldProps.setInternshipForm((previous) => ({ ...previous, description: "Unsaved activities" }));
  form = h.render(); form.handleAction(new FormData()); await h.settle(); form = h.render();
  assert.equal(form.status, false); assert.equal(form.fieldProps.internshipForm.description, "Unsaved activities");
  h.setResponse({ success: false, refreshRecord: true });
  form.handleAction(new FormData()); await h.settle(); assert.equal(h.conflicts, 1); assert.equal(h.updated.length, 0);
  h.setRecord({ ...original, status: "ongoing" }); form = h.render();
  assert.equal(form.isEditing, false); assert.equal(form.status, true);
  assert.equal(form.fieldProps.internshipForm.description, "Saved activities");
  const count = h.calls.length; form.handleAction(new FormData()); assert.equal(h.calls.length, count);
});

test("another save is blocked while a pending update is in progress", async () => {
  const h = harness(); let finish;
  h.setResponse(new Promise((resolve) => { finish = resolve; }));
  h.render().handleAction(new FormData()); h.setPending(true);
  h.render().handleAction(new FormData()); assert.equal(h.calls.length, 1);
  finish({ success: true, record: original }); await h.settle(); h.setPending(false);
  assert.equal(h.render().status, false); assert.equal(h.render().isEditing, true);
});

test("missing IDs stay protected and new records retain the create flow", async () => {
  const loading = harness({ ...original, id: undefined }); loading.render().handleAction(new FormData());
  assert.equal(loading.render().status, true); assert.equal(loading.calls.length, 0);
  const h = harness(null); let form = h.render();
  assert.equal(form.isCurrentRecord, false); assert.equal(form.status, false);
  form.fieldProps.setInternshipForm(internshipRecordFields(original)); form = h.render();
  h.setResponse({ success: true }); form.handleAction(new FormData()); await h.settle();
  assert.equal(h.calls[0].type, "create"); assert.equal(h.calls[0].args.length, 1);
  assert.equal(h.created.length, 1); assert.equal(h.updated.length, 0);
  assert.equal(h.render().fieldProps.internshipForm.company_name, "");
});
