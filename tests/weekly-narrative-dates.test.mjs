import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as dates from "../lib/weekly-narrative-dates.mjs";
import { weeklyNarrativesHtml } from "../app/_services/weeklyNarrativesTemplate.js";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks = {}) {
  const url = new URL(`../components/weekly-narratives-ui/${file}`, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) {
    if (id === "./NarrativeRotations" || id === "./NarrativeRotationPicker") return () => null;
    if (id === "@/lib/weekly-narrative-dates.mjs") return dates;
    return Object.hasOwn(mocks, id) ? mocks[id] : require(id);
  } });
  return mod.exports.default;
}
const entry = { id: 1, week_number: 2, title: "Weekly work", created_at: "2026-10-25T10:00:00Z", date_from: "2026-10-19", date_to: "2026-10-23" };
const Range = load("NarrativeDateRange.js");

test("coverage date formatting is calendar-based and rejects partial, invalid or reversed ranges", () => {
  assert.equal(dates.formatNarrativeRange(entry.date_from, entry.date_to), "October 19, 2026 to October 23, 2026");
  assert.equal(dates.formatNarrativeRange("2024-02-29", "2024-02-29"), "February 29, 2024 to February 29, 2024");
  for (const [from, to] of [[null, null], ["2026-10-19", null], ["2026-02-30", "2026-03-01"], ["2026-10-23", "2026-10-19"], ["2026-10-19T00:00:00Z", "2026-10-23"]]) assert.equal(dates.formatNarrativeRange(from, to), null);
});

test("cards distinguish the coverage range from the submission date and keep legacy entries readable", () => {
  const html = renderToStaticMarkup(React.createElement(Range, { narrative: entry }));
  assert.match(html, /October 19, 2026 to October 23, 2026/);
  assert.match(html, /Submitted Oct 25, 2026/);
  assert.match(html, /Week 2/);
  const legacy = renderToStaticMarkup(React.createElement(Range, { narrative: { ...entry, date_from: null, date_to: null } }));
  assert.match(legacy, /Date range not set/); assert.match(legacy, /Submitted/);
  for (const name of ["WeeklyNarrativeCard.js", "RecordsNarratives.js"]) {
    const Card = load(name, {
      "./NarrativeDateRange": Range, "./NarrativePreview": () => "Saved narrative text",
      "./WeeklyNarrativeEditForm": () => null, "./WeeklyNarrativeDelete": () => null,
      "../ui/Modal": ({ children }) => children,
    });
    const card = renderToStaticMarkup(React.createElement(Card, { narrative: entry }));
    assert.match(card, /October 19, 2026 to October 23, 2026/);
    assert.match(card, /Saved narrative text/);
  }
});

test("create and edit forms require both dates, prefill saved ranges, and clear an invalid end date", () => {
  for (const data of [null, entry]) {
    const state = []; let cursor = 0, inputs, actions;
    const wrap = (tag) => function FormPart({ children, ...props }) { return React.createElement(tag, props, children); };
    const ModalForm = { Root: wrap("form"), Section: wrap("section"), Row: wrap("div"), Field: ({ children }) => children,
      Input: (props) => { inputs[props.name] = props; return React.createElement("input", props); },
      Textarea: wrap("textarea"), Actions: (props) => { actions = props; return null; } };
    const Form = load("WeeklyNarrativeForm.js", {
      "@/components/ui/ModalForm": ModalForm,
      react: { ...React, useState: (initial) => { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], (value) => { state[index] = value; }]; } },
    });
    function render(isPending = false) { cursor = 0; inputs = {}; renderToStaticMarkup(React.createElement(Form, { handleAction() {}, isPending, data, type: data ? "edit" : "post" })); }
    render();
    assert.equal(inputs.date_from.type, "date"); assert.equal(inputs.date_to.type, "date");
    assert.equal(inputs.date_from.required, true); assert.equal(inputs.date_to.required, true);
    assert.equal(inputs.date_from.value, data?.date_from || "");
    assert.equal(inputs.date_to.value, data?.date_to || "");
    assert.equal(inputs.date_to.disabled, !data);
    assert.equal(actions.closeOnSubmit, false);
    inputs.date_from.onChange({ target: { value: "2026-10-19" } }); render();
    assert.equal(inputs.date_to.min, "2026-10-19"); assert.equal(inputs.date_to.disabled, false);
    inputs.date_to.onChange({ target: { value: "2026-10-23" } }); render();
    inputs.date_from.onChange({ target: { value: "2026-10-24" } }); render(); assert.equal(inputs.date_to.value, "");
    render(true); assert.equal(inputs.date_from.disabled, true); assert.equal(inputs.date_to.disabled, true);
  }
});

test("full narrative preview shows the saved coverage dates", () => {
  let description;
  const Preview = load("NarrativePreview.js", {
    react: { ...React, useState: () => [true, () => {}], useRef: () => ({ current: null }), useEffect() {} },
    "../ui/Modal": (props) => { description = props.description; return props.children; },
  });
  renderToStaticMarkup(React.createElement(Preview, { narrative: { ...entry, narrative: "Long saved narrative" } }));
  assert.equal(description, "October 19, 2026 to October 23, 2026 · Week 2");
});

test("printed journals use each saved range and leave legacy dates blank, never substituting created_at", () => {
  const html = weeklyNarrativesHtml({ student_name: "Student", company_name: "Company", narratives: [
    { ...entry, narrative: "First entry" },
    { ...entry, week_number: 3, date_from: "2026-10-26", date_to: "2026-10-30", narrative: "Second entry" },
    { ...entry, week_number: 4, date_from: null, date_to: null, narrative: "Legacy entry" },
  ] });
  assert(html.includes("<strong>Date:</strong> October 19, 2026 to October 23, 2026"));
  assert(html.includes("<strong>Date:</strong> October 26, 2026 to October 30, 2026"));
  assert(html.includes("<strong>Date:</strong> ___ to ___"));
  assert(!html.includes("October 25, 2026"));
});
