# Internship analytics and Registrar dashboard manual

## Company analytics: admins and ordinary department heads

Open **Company Analytics** from Staff tools, or **View internship company analytics** on the existing admin/head dashboard. Registrar heads, employers and students cannot use it. Admins filter Departments, Courses, Academic year, Term and internship start-date range; heads see their own department and its courses. Changing the selected department resets course selection. Select **Apply filters** to refresh the report, or **Reset** for all available history. Current period, scope and snapshot are shown above the cards.

The student counts come from ongoing and finished internship records linked to student accounts. Each student counts once at each company: one student at two companies adds one student to each company, while two records for that student at the same company still add only one. Pending, rejected, deleted records and deleted student accounts do not count. Manually posted Past Internship entries supply company names but do not add students to these counts. Company names that differ only in capitalization or spacing are grouped; different names remain separate. Department and course filters use the student's latest academic information, even for an older internship.

Most/least popular lists include ties; least excludes zeros. Compare the ranked bar chart, distribution and detailed report. Distribution is based on student/company pairs: one person at two companies is two pairs but one distinct student. Status columns give ongoing precedence if a pair has both statuses, so the table and cards reconcile. Monthly trends count distinct pairs separately in each start month, and cannot be summed into the all-period distinct total. Undated records are included only when applicable; date/year filters exclude them. The disclosure also reports unnamed records omitted from company ranking.

Dates are inclusive **internship start dates**. Academic years and terms follow existing SIPP semester rules. **Zero placements** means no linked, confirmed student internship matches the current filters. For example, a company with one finished placement in 2025–2026 shows zero when viewing only 2026–2027. A company added only through a manually posted Past Internship can also show zero because that entry has no linked student placement to count. Zero does not mean the company has never hosted an intern or has no vacancies. These companies are separate from the least-popular ranking, which includes only companies with at least one matching student.

The report table pages ten companies at a time and scrolls horizontally inside its card on phones. **CSV report** and **Preview PDF** include the entire filtered ranked and zero-match lists. Preview PDF uses the shared React-PDF modal at 75% zoom, with explicit Download and Print actions. It regenerates the full report through the authorized backend API using the applied filters. Snapshots show when the report was read; Refresh obtains a new consistent read. Empty states mean no matches; failed reads show Retry/Clear filters, never invented zero totals.

## Registrar dashboard

The Registrar's **Dashboard** now opens a dedicated SIPP overview at `/department_head`. Its default/reset is the current academic year; choose another saved academic year and Apply filters. The dashboard shows:

- Annex C reports, drafts and submitted reports using actual saved statuses.
- Distinct confirmed students in the Annex D population, with department/course coverage.
- A submission trend from real Annex C submission dates and recent saved reports.

No student-account totals, private attendance/evaluation analytics, company popularity or document-verification/correction queues are added. Draft means an existing draft report, not a record awaiting verification. Annex D follows the existing authorized report population, including retained historical accounts where their placement/profile remains reportable. Missing academic/course/profile data is excluded as in the official report.

Select a card to open **SIPP Reports** with the academic year, Annex C/Annex D tab and draft/submitted status preserved. Complete drafts or preview/download official Annex C/D PDFs there. The recent report list opens the existing report list. The Registrar does not receive a Company Analytics navigation link and the API also denies it.

## Responsive behavior and setup

Both screens reuse the current dashboard components: one stat card per row on small phones, two at `sm`, four at `lg`; filters stack/wrap, charts resize in `min-w-0` containers, long labels shorten and are available in hover or tap tooltips, distribution legends wrap and tables scroll within their cards. The comparison chart caps at ten bars; the full table/export remains available. Loading skeletons mirror the layout; no feature silently treats an error as an empty report.

Apply the backend's read-only `scripts/2026-10-31-company-analytics.sql` verification file before paired deployment. There are **no schema changes, data migration, new environment variables or packages**. Existing confirmed records, academic membership, manual alumni company directory and SIPP reports already contain the needed data. The new endpoints are `/api/v1/analytics/companies` and `/api/v1/registrar/dashboard` with the standard compatibility alias and fresh backend permission checks.

The detailed backend definition/limitations are in `features/analytics/README.md` of the paired backend checkout. Source guides for `/help` and page manuals are `components/help-ui/guides/analyticsGuides.js`.

## Implementation validation (October 31, 2026)

The production build and targeted ESLint checks passed. Twenty frontend tests passed across dashboard rendering/exports, help/manual role rules and announcement navigation regressions; eighteen backend tests passed across analytics and existing official-report caching/permissions. Analytics fixtures verify duplicate placements, ongoing/finished reconciliation, inclusive dates, academic years/terms, department transfer scoping, rejected/unauthenticated roles, separate zeros, Registrar report population and rollback/release on failure.

An isolated production-browser fixture checked both dashboards at 320×721, 768×900 and 1440×900. All six layouts had no page overflow; charts resized, narrow tables scrolled within their cards, long touch tooltips stayed on-screen and the Registrar had no company analytics navigation. Full CSV and print content included rows beyond the first table page and the zero-match directory. No production database was accessed or changed. MySQL transaction behavior and deployed data still require deployment verification; SQLite fixtures do not simulate real MySQL concurrency.
