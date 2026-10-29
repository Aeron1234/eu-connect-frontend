import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { companyWebsiteHref } from "../lib/company-website.mjs";

test("saved company websites support bare domains without duplicating protocols or enabling unsafe schemes", () => {
  assert.equal(companyWebsiteHref(" www.company.example.test "), "https://www.company.example.test/");
  assert.equal(companyWebsiteHref("https://www.facebook.com/company"), "https://www.facebook.com/company");
  assert.equal(companyWebsiteHref("http://company.example.test/about"), "http://company.example.test/about");
  for (const value of [undefined, null, "", " ", "javascript:alert(1)", "data:text/html,test", "mailto:company@example.test", "https://user:secret@company.example.test", "not a website"]) assert.equal(companyWebsiteHref(value), null);
});

const require = createRequire(import.meta.url);
const { transformSync } = require("next/dist/compiled/babel/core");
const source = new URL("../components/internship-records-ui/RecordOverviewTab.js", import.meta.url);
const { code } = transformSync(readFileSync(source, "utf8"), {
  filename: source.pathname, babelrc: false, configFile: false,
  presets: [[require("next/babel"), { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
});
const compiledModule = { exports: {} };
vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require(id) {
  if (id === "@/lib/company-website.mjs") return { companyWebsiteHref };
  if (["./CompanyRotations", "./RecordsCompanyMap", "../ui/ProgressBar"].includes(id)) return { __esModule: true, default: () => null };
  return require(id);
} });
const Overview = compiledModule.exports.default;

test("staff Overview exposes the saved website and keeps legacy missing websites readable with a dash", () => {
  const record = { company_name: "Company", date_started: "2026-10-01", created_at: "2026-10-01", status: "ongoing", accumulated_hours: 0, total_hours: 200, dtr_count: 0, narrative_count: 0, document_count: 0 };
  for (const website of ["www.company.example.test", null, "", undefined, "javascript:alert(1)"]) {
    const dom = new JSDOM(renderToStaticMarkup(React.createElement(Overview, { record: { ...record, company_website: website }, internshipId: "record" })));
    try {
      const label = [...dom.window.document.querySelectorAll("dt")].find(el => el.textContent === "Company website");
      const value = label.nextElementSibling;
      if (website === "www.company.example.test") {
        const link = value.querySelector("a"); assert.equal(link.getAttribute("href"), "https://www.company.example.test/");
        assert.equal(link.target, "_blank"); assert.match(link.rel, /noopener/); assert.match(link.rel, /noreferrer/);
      } else {
        assert.equal(value.querySelector("a"), null); assert.equal(value.textContent, website || "-");
      }
    } finally { dom.window.close(); }
  }
});
