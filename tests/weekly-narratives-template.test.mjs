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
  assert.match(html, /A4 portrait; margin: 1cm/);
  assert.match(html, /<strong>Week:<\/strong> 1 &mdash; First/);
  assert.match(html, /<strong>Week:<\/strong> 2 &mdash; Second/);
  assert.equal((html.match(/<h1>Practicum Journal<\/h1>/g) || []).length, 2);
  assert.match(html, /font-size: 13pt/);
  assert.match(html, /text-indent: 1cm/);
  assert.match(html, /article \+ article \{ break-before: page/);
  assert.equal((html.match(/<strong>Date:<\/strong> ___ to ___/g) || []).length, 2);
  assert.match(html, /Company &amp; Co\./);
  assert.match(html, /Jane &lt;Student&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
