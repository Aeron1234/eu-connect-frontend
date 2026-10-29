import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import * as dates from "../components/internship-records-ui/internshipDateInput.mjs";

test("MM/dd/yyyy date entry round-trips ISO dates and rejects impossible or partial dates", () => {
  assert.equal(dates.formatInternshipInputDate("2026-10-30"), "10/30/2026");
  assert.equal(dates.parseInternshipInputDate("10/30/2026"), "2026-10-30");
  assert.equal(dates.parseInternshipInputDate("02/29/2028"), "2028-02-29");
  assert.equal(dates.maskInternshipInputDate("10302026"), "10/30/2026");
  for (const input of ["30/10/2026", "02/29/2026", "02/30/2028", "10/3", "2026-10-30", ""]) assert.equal(dates.parseInternshipInputDate(input), "");
  assert.equal(dates.formatInternshipInputDate("2026-02-30"), "");
});

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const Calendar = () => null;
const Wrapper = ({ children }) => React.createElement("div", null, children);
const content = () => null;
const url = new URL("../components/internship-records-ui/InternshipDateInput.js", import.meta.url);
const { code } = transformSync(readFileSync(url, "utf8"), {
  filename: url.pathname, babelrc: false, configFile: false,
  presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
});
function harness(initial = {}) {
  const states = []; let index = 0;
  let props = { name: "date_started", label: "Start date *", value: "2026-10-30", ...initial };
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, require(id) {
    if (id === "react") return { useState(initial) { const slot = index++; if (!(slot in states)) states[slot] = initial; return [states[slot], value => { states[slot] = value; }]; } };
    if (id === "radix-ui") return { Popover: { Root: Wrapper, Trigger: Wrapper, Portal: Wrapper, Content: content } };
    if (id === "@/components/ui/calendar") return { Calendar };
    if (id === "./internshipFormStyles") return { inputClass: "input", labelClass: "label" };
    if (id === "./internshipDateInput.mjs") return dates;
    return require(id);
  } });
  return {
    render() { index = 0; return compiled.exports.default({ ...props, onChange: value => { props = { ...props, value }; } }); },
    reset(next) { props = { ...props, ...next }; },
  };
}
function find(element, predicate) {
  if (!React.isValidElement(element)) return null;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props.children)) { const result = find(child, predicate); if (result) return result; }
  return null;
}

test("visible date format is stable while form submissions keep ISO; invalid edits cannot submit the old value", () => {
  const h = harness(); let tree = h.render();
  const dom = new JSDOM(`<form>${renderToStaticMarkup(tree)}</form>`);
  try {
    assert.equal(dom.window.document.querySelector('input[type="text"]').value, "10/30/2026");
    assert.equal(new dom.window.FormData(dom.window.document.querySelector("form")).get("date_started"), "2026-10-30");
  } finally { dom.window.close(); }
  find(tree, node => node.props.id === "date_started").props.onChange({ target: { value: "12312026" } }); tree = h.render();
  assert.equal(find(tree, node => node.props.id === "date_started").props.value, "12/31/2026");
  assert.equal(find(tree, node => node.props.name === "date_started").props.value, "2026-12-31");
  find(tree, node => node.props.id === "date_started").props.onChange({ target: { value: "02302026" } }); tree = h.render();
  assert.equal(find(tree, node => node.props.name === "date_started").props.value, "");
  let validity;
  find(tree, node => node.props.id === "date_started").props.ref({ setCustomValidity: message => { validity = message; } });
  assert.match(validity, /MM\/dd\/yyyy/);
});

test("calendar selection and parent resets update the formatted dates; read-only fields stay disabled", () => {
  const h = harness(); let tree = h.render();
  find(tree, node => node.type === Calendar).props.onSelect(new Date(2027, 0, 15)); tree = h.render();
  assert.equal(find(tree, node => node.props.id === "date_started").props.value, "01/15/2027");
  assert.equal(find(tree, node => node.props.name === "date_started").props.value, "2027-01-15");
  h.reset({ value: "2026-10-30", disabled: true }); tree = h.render();
  assert.equal(find(tree, node => node.props.id === "date_started").props.value, "10/30/2026");
  assert.equal(find(tree, node => node.props.id === "date_started").props.disabled, true);
  assert.equal(find(tree, node => node.props.name === "date_started").props.disabled, true);
});
