import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import React, { act } from "react";
import { JSDOM } from "jsdom";
import * as domHelpers from "../lib/office-preview-dom.mjs";
import { downloadPdfBlob } from "../components/ui/downloadPdf.js";

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");

test("Office viewer prints only the complete document through react-to-print and downloads unchanged bytes", async t => {
  const blob = new Blob(["First line\nSecond line\nFinal line"], { type: "text/plain" });
  const dom = new JSDOM("<!doctype html><html><head></head><body><p>Private surrounding application</p><div id='app'></div></body></html>", { url: "https://app.example.test" });
  const globals = ["window", "document", "navigator", "Node", "HTMLElement", "Element", "HTMLIFrameElement", "HTMLImageElement"];
  const previous = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of globals) Object.defineProperty(globalThis, name, { value: dom.window[name], writable: true, configurable: true });
  const oldAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const createUrl = URL.createObjectURL, revokeUrl = URL.revokeObjectURL;
  const downloads = [], printed = [], urls = [];
  URL.createObjectURL = value => { urls.push(value); return "blob:original-document"; };
  URL.revokeObjectURL = () => {};
  dom.window.HTMLAnchorElement.prototype.click = function() { downloads.push({ name: this.download, href: this.href }); };
  const body = dom.window.document.body, append = body.appendChild.bind(body);
  body.appendChild = node => {
    const result = append(node);
    if (node.tagName === "IFRAME") {
      node.contentWindow.focus = () => {};
      node.contentWindow.print = () => printed.push(node.contentDocument.body.innerHTML);
    }
    return result;
  };
  let root;
  t.after(async () => {
    if (root) await act(async () => root.unmount());
    URL.createObjectURL = createUrl; URL.revokeObjectURL = revokeUrl;
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldAct;
    for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
    dom.window.close();
  });
  const fileUrl = new URL("../components/ui/OfficeViewer.js", import.meta.url);
  const { code } = transformSync(readFileSync(fileUrl, "utf8"), { filename: fileUrl.pathname, babelrc: false, configFile: false,
    presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]] });
  const mocks = {
    "./select": {}, "./ErrorUI": ({ error }) => React.createElement("p", { role: "alert" }, error.message),
    "./downloadPdf": { downloadPdfBlob }, "../../lib/office-preview-dom.mjs": domHelpers,
    "./officeWorkerClient.mjs": { parseOfficeFile: () => { throw new Error("Text preview should not use the Office worker."); } },
  };
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, AbortController, URL, setTimeout, clearTimeout,
    require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  const Viewer = compiled.exports.default;
  const { createRoot } = await import("react-dom/client");
  root = createRoot(dom.window.document.getElementById("app"));
  await act(async () => root.render(React.createElement(Viewer, { file: { blob, filename: "original.txt", kind: "text" } })));
  const iframe = dom.window.document.querySelector("iframe");
  assert.equal(iframe.getAttribute("sandbox"), "allow-same-origin");
  await act(async () => { iframe.dispatchEvent(new dom.window.Event("load")); await new Promise(resolve => setTimeout(resolve, 20)); });
  const find = text => Array.from(dom.window.document.querySelectorAll("button")).find(button => button.textContent.includes(text));
  for (let attempt = 0; find("Print")?.disabled && attempt < 20; attempt++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
  assert.equal(find("Print").disabled, false);
  assert(dom.window.document.body.textContent.includes("75%"));
  assert.equal(iframe.contentDocument.querySelector(".office-text").textContent, await blob.text());
  await act(async () => { find("Print").click(); await new Promise(resolve => setTimeout(resolve, 750)); });
  assert.equal(printed.length, 1);
  assert(printed[0].includes("First line")); assert(printed[0].includes("Final line"));
  assert(!printed[0].includes("Private surrounding application"));
  assert(!printed[0].includes("Download original file"));
  assert(!printed[0].includes('zoom: 0.75'));
  await act(async () => find("Download original file").click());
  assert.equal(downloads.length, 1); assert.equal(downloads[0].name, "original.txt");
  assert.equal(urls[0], blob); assert.equal(await urls[0].text(), "First line\nSecond line\nFinal line");
});
