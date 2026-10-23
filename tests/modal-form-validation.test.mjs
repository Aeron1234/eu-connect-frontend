import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getModalFormError, validateModalForm } from "../lib/modal-form-validation.mjs";
import * as actionToasts from "../lib/toast-and-action.mjs";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks) {
  const url = new URL("../components/" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) {
    return Object.hasOwn(mocks, id) ? mocks[id] : require(id);
  } });
  return mod.exports.default;
}
function field(overrides = {}) {
  return { name: "title", type: "text", value: "", required: true, willValidate: true, disabled: false,
    validity: { valid: true }, dataset: {}, focus() { this.focused = true; }, scrollIntoView() {},
    ...overrides };
}
function form(elements, groups = []) { return { elements, querySelectorAll: () => groups }; }
function event(currentTarget, submitter) {
  return { currentTarget, nativeEvent: { submitter }, target: { closest: () => submitter }, defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; } };
}

test("missing and whitespace-only required inputs report one named action error and preserve entered values", () => {
  for (const value of ["", "   "]) {
    const missing = field({ name: "alumni_name", value, labels: [{ textContent: " Alumni Name * " }] });
    const entered = field({ name: "company_name", value: "Saved company" });
    const errors = [];
    assert.equal(validateModalForm(form([entered, missing]), message => errors.push(message)), false);
    assert.deepEqual(errors, ["Alumni Name is required."]);
    assert.equal(missing.focused, true);
    assert.equal(entered.value, "Saved company");
  }
});

test("required custom selections focus their visible trigger and optional hidden values stay optional", () => {
  const trigger = { focus() { this.focused = true; }, scrollIntoView() {} };
  const course = field({ name: "course_id", type: "hidden", willValidate: false, dataset: { validationLabel: "Course", validationFocus: "course-trigger" } });
  const view = form([field({ name: "id", type: "hidden", willValidate: false, required: false }), course]);
  view.ownerDocument = { getElementById: id => id === "course-trigger" ? trigger : null };
  const errors = [];
  assert.equal(validateModalForm(view, message => errors.push(message)), false);
  assert.deepEqual(errors, ["Course is required."]); assert.equal(trigger.focused, true);
  course.value = "course-1";
  assert.equal(validateModalForm(view, message => errors.push(message)), true);
  const category = field({ name: "requirement_type_id", type: "select-one", validity: { valid: false, valueMissing: true },
    getAttribute: name => name === "aria-hidden" ? "true" : null, parentElement: { querySelector: () => trigger } });
  trigger.focused = false;
  assert.equal(validateModalForm(form([category]), () => {}), false);
  assert.equal(trigger.focused, true);
});

test("native format, number, date and file errors become toast errors; disabled and optional inputs do not block", () => {
  for (const type of ["email", "number", "date", "file"]) {
    const invalid = field({ type, value: type === "file" ? "" : "invalid", validationMessage: "Check this input.", validity: { valid: false } });
    assert.equal(getModalFormError(form([invalid])).message, "Check this input.");
  }
  const disabledByFieldset = field({ matches: selector => selector === ":disabled" });
  assert.equal(getModalFormError(form([field({ disabled: true }), disabledByFieldset, field({ required: false }), field({ type: "number", value: 0 })])), null);
});

test("eligible courses require at least one selection rather than every checkbox", () => {
  const choices = [field({ type: "checkbox", required: false, checked: false }), field({ type: "checkbox", required: false, checked: false })];
  const group = { dataset: { requiredGroup: "course_ids", validationMessage: "Select at least one eligible course." }, querySelectorAll: () => choices };
  assert.equal(getModalFormError(form([], [group])).message, "Select at least one eligible course.");
  choices[1].checked = true;
  assert.equal(getModalFormError(form([], [group])), null);
});

function modalFixture(confirmation = null) {
  const errors = [];
  const part = () => null;
  const ModalForm = load("ui/ModalForm.js", {
    "@/components/ui/dialog": { DialogClose: part, DialogFooter: part }, "@/components/ui/button": { Button: part }, "@/components/ui/spinner": { Spinner: part },
    "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
    "./modalFormStyles": {}, "./ConfirmationContent": { useConfirmationLayout: () => confirmation },
    "@/lib/modal-form-validation.mjs": { validateModalForm }, "@/lib/toast-and-action.mjs": actionToasts,
    sonner: { toast: { error(message, options) { errors.push({ message, ...options }); } } },
  });
  return { ModalForm, errors };
}

test("all shared modal layouts block invalid submit clicks before DialogClose can close them", () => {
  for (const confirmation of [null, { descriptionId: "confirm" }]) {
    const { ModalForm, errors } = modalFixture(confirmation);
    const action = () => { throw new Error("Invalid form must not reach the action"); };
    const root = ModalForm.Root({ action, children: null });
    assert.equal(root.props.action, action); assert.equal(root.props.noValidate, true);
    const view = form([field({ dataset: { validationLabel: "Alumni Name" } })]);
    const button = { type: "submit", form: view };
    const click = event(view, button);
    root.props.onClickCapture(click);
    let open = true;
    // Radix DialogClose only closes when the click was not prevented.
    if (!click.defaultPrevented) open = false;
    assert.equal(open, true); assert.equal(errors.length, 1);
    assert.equal(errors[0].message, "Alumni Name is required.");
    assert.deepEqual(errors[0].style, { backgroundColor: "#FEE2E2", color: "#991B1B" });
    const submit = event(view, button);
    root.props.onSubmit(submit);
    assert.equal(submit.defaultPrevented, true);
  }
});

test("keyboard submission validates too; corrected forms and existing submit callbacks still work", () => {
  const { ModalForm, errors } = modalFixture();
  let submitted = 0;
  const root = ModalForm.Root({ onSubmit(e) { e.preventDefault(); submitted++; }, children: null });
  const title = field(); const view = form([title]);
  const submit = event(view);
  root.props.onSubmit(submit); assert.equal(submit.defaultPrevented, true); assert.equal(submitted, 0);
  title.value = "Completed title";
  const valid = event(view); root.props.onSubmit(valid);
  assert.equal(submitted, 1); assert.equal(errors.length, 1);
  const cancel = event(view, { type: "button", form: view }); title.value = "";
  root.props.onClickCapture(cancel); assert.equal(cancel.defaultPrevented, false); assert.equal(errors.length, 1);
});

test("past-internship create and edit require course and preserve optional fields", () => {
  for (const type of ["create", "edit"]) {
    const inputs = [];
    const wrap = ({ children }) => children;
    const Form = load("past-internship-ui/PastInternshipPostEditForm.js", {
      "@/components/ui/ModalForm": { __esModule: true, default: { Root: wrap, Section: wrap, Input: props => { inputs.push(props); return null; }, Textarea: props => { inputs.push(props); return null; }, Actions: () => null } },
      "@/components/ui/modalFormStyles": {},
      "@/components/ui/select": { Select: wrap, SelectContent: wrap, SelectGroup: wrap, SelectItem: wrap, SelectLabel: wrap, SelectTrigger: wrap, SelectValue: () => null },
    });
    renderToStaticMarkup(React.createElement(Form, { type, data: { course_id: "saved-course" } }));
    const required = inputs.filter(input => input.required).map(input => input.name);
    assert.deepEqual(required, ["alumni_name", "company_name", "industry", "course_id", "company_address", "batch_year", "academic_year"]);
    const course = inputs.find(input => input.name === "course_id");
    assert.equal(course.value, type === "edit" ? "saved-course" : "");
    assert(course["data-validation-focus"]);
    for (const name of ["internship_position", "total_hours", "accumulated_hours", "supervisor_name", "notes"]) assert(!inputs.find(input => input.name === name).required);
  }
});
