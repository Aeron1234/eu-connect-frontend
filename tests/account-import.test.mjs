import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as identity from "../lib/studentIdentity.mjs";
const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
function load(file, mocks) {
  const url = new URL("../" + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, "utf8"), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); }, console });
  return mod.exports.default;
}
function hooks() {
  const state = [], refs = []; let cursor = 0, refCursor = 0;
  return { reset() { cursor = 0; refCursor = 0; }, api: { ...React, useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = initial;
    return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
  }, useRef(initial) { return refs[refCursor++] ||= { current: initial }; }, useEffect() {}, useTransition: () => [false, fn => fn()] } };
}

test("student username follows edits while other roles retain their entered usernames", () => {
  const h = hooks();
  const FormHook = load("components/account-ui/useCreateAccountForm.js", {
    react: h.api, "@/lib/studentIdentity.mjs": identity, "@/lib/helpers": {}, "@/lib/server-actions/account-actions": {},
  });
  const props = { roles: [{ id: 1, role: "student" }, { id: 2, role: "employer" }], courses: [], departments: [] };
  const render = () => { h.reset(); return FormHook(props); };
  let form = render();
  form.roleProps.setSelectedRole("1");
  form.identityProps.setAccountForm(previous => ({ ...previous, first_name: "John Carlo", last_name: "Dela Cruz", school_id: "a24-0483", username: "manual" }));
  form = render();
  assert.equal(form.credentialsProps.accountForm.username, "DelaCruz.JohnCarlo.A24-0483");
  assert.equal(form.previewProps.accountForm.username, form.credentialsProps.accountForm.username);
  form.identityProps.setAccountForm(previous => ({ ...previous, last_name: "Perez" }));
  assert.equal(render().credentialsProps.accountForm.username, "Perez.JohnCarlo.A24-0483");
  form.roleProps.setSelectedRole("2");
  assert.equal(render().credentialsProps.accountForm.username, "manual");

  const Fields = load("components/account-ui/AccountCredentialsFields.js", { "./accountFormStyles": {} });
  const html = renderToStaticMarkup(React.createElement(Fields, { ...form.credentialsProps, isStudent: true }));
  assert.match(html, /name="school_id"/);
  assert.match(html, /readOnly=""/);
});

test("CSV cannot import until validated and refreshes the account list only after confirmed creation", async () => {
  const h = hooks(); let imported = 0, refreshed = 0;
  const data = { first_name: "Juan", last_name: "Perez", email: "juan@example.test" };
  const View = load("components/account-ui/BulkAccountImport.js", {
    react: h.api,
    "@/lib/server-actions/account-actions": {
      previewStudentCsv: async csv => { assert.equal(csv, "csv"); return { success: true, rows: [{ row: 2, data, username: "Perez.Juan" }] }; },
      importStudentCsv: async () => { imported++; return { success: true, results: [{ row: 2, data, status: "created", accountId: "id", username: "Perez.Juan" }] }; },
    },
    "./ResendAccountInvitation": () => null, "./accountFormStyles": {},
  });
  const render = () => { h.reset(); return View({ onCreated: () => refreshed++ }); };
  const elements = node => !node || typeof node !== "object" ? [] : [node, ...React.Children.toArray(node.props?.children).flatMap(elements)];
  let tree = render();
  await elements(tree).find(n => n.type === "input").props.onChange({ target: { files: [{ name: "students.csv", size: 3, text: async () => "csv" }] } });
  tree = render();
  assert.equal(imported, 0);
  await elements(tree).find(n => n.type === "button" && n.props.children === "Validate and preview").props.onClick();
  tree = render();
  await elements(tree).find(n => n.type === "button" && n.props.children === "Create 1 accounts").props.onClick();
  assert.equal(imported, 1);
  assert.equal(refreshed, 1);
  assert.match(renderToStaticMarkup(tree), /Perez.Juan/);
});
