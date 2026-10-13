import { test } from "node:test";
import assert from "node:assert/strict";
import { weeklyNarrativesHtml } from "../app/_services/weeklyNarrativesTemplate.js";

test("weekly narratives print template includes all entries and escapes student text", () => {
  const html = weeklyNarrativesHtml({
    company_name: "Company & Co.",
    student_name: "Jane <Student>",
    narratives: [
      { week_number: 1, title: "First", narrative: "Worked on <script>" },
      { week_number: 2, title: "Second", narrative: "Learned more" },
    ],
  });
  assert.match(html, /A4 portrait; margin: 1in/);
  assert.match(html, /Week 1 — First/);
  assert.match(html, /Week 2 — Second/);
  assert.match(html, /Company &amp; Co\./);
  assert.match(html, /Jane &lt;Student&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
