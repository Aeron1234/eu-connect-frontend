# Feature manuals and Help audit

Reviewed against the local frontend and companion backend source on October 30, 2026.
This is a source audit, not a claim that production, email delivery, geolocation or
printed page layout was exercised. No live database was queried.

## Where instructions live

- `components/help-ui/guides/`: student, employer, department-head, administrator,
  and shared guides. `commonGuides.js` holds reused workflows.
- `components/help-ui/helpContent.js`: applies role and registrar visibility.
- `/help`: searchable guide cards opening the existing scrollable modal.
- `HelpManual`: page info buttons use the same filtered guide objects as Help.
- `components/ui/PageManual.js`: maps page IDs and supplies profile instructions
  for the viewer/target/supervision context.
- Company rotations now has its own info button and shared guide. Students get
  the My Records destination; authorized staff get Records. Employers and
  registrar heads are not offered a rotation management guide.

## Audited coverage

Company analytics / Registrar update: `/help` and both page manuals now share `guides/analyticsGuides.js`. Admin/ordinary-head guidance defines confirmed distinct student/company counts, scoped filters, zero directory, status precedence, non-additive month trends and full aggregate CSV/print export. Registrar guidance describes only existing Annex C statuses and Annex D population/coverage, default current year and filtered links to SIPP; no popularity or private approval/document metrics. Dashboard is restored to REG navigation and its former SIPP redirect removed. See [analytics-dashboards.md](analytics-dashboards.md) and the backend read-only SQL verification migration.

Announcement audience update: manuals now distinguish usual school/department sharing from **Tagged students only**. Targeted posts require at least one tag and restrict viewing/notifications to involved people, with admin read access but no automatic admin alert. The employer checkbox adds tagged supervisors. Backend audience/privacy checks cover calendar and notifications too; apply the targeted-audience migration after student tags before deployment.

October 31 announcement update: create/edit forms support optional searchable student tags, persistent selection and removal. Checked employer visibility targets current supervisors when students are tagged, otherwise all employers; unchecked excludes employers. School visibility and category restrictions remain unchanged. Help/page manuals explain scope and notifications. Backend migration: `2026-10-31-announcement-student-tags.sql`; deploy it before the matching applications.

October 30: Added role-specific **DTR Locations** guidance to `/help` and the page manual using `guides/bulkDtrGuide.js`, with full workflow in [bulk-dtr-locations.md](bulk-dtr-locations.md). Covers individual/bulk selection, page-scoped Select all, retained selections, dependent admin filters, 100-record limit, map/group membership privacy, confirmation/reassignment, results/retry, radius and student/grouped employer notifications. Registrar heads and students do not receive this management guide. The existing single-location guide links to the bulk workflow and retains live sharing/removal instructions.

November 3: Updated the shared DTR Locations guide for the live student pin on the bulk page. It explains one-student-at-a-time watching, the GPS accuracy circle, how **Use student's pin** copies a draft for all selected interns, and the required review/confirmation. The student dashboard Help guide clarifies that sharing does not change a saved DTR location.

Paths below are repository-relative; backend sources are in the companion backend repository.

| Feature | Current manual contract | Main source checked |
| --- | --- | --- |
| Sign-in, onboarding and recovery | Username sign-in after a one-use setup link; new-account invitation lasts 24 hours, existing-user recovery 30 minutes; newest link replaces earlier links; recovery confirmation does not prove delivery. | Backend `features/auth/accountSetup.js`; frontend `components/auth-ui/` |
| Admin Accounts | Required email and role-specific academic details; no administrator password; active pending accounts can receive a replacement invitation after the one-minute cooldown. | `components/account-ui/`; backend account/auth features |
| Account profile/security | Role-specific profile changes, current-password change, separate recovery flow. | `components/account-ui/`; backend accounts/auth |
| Student dashboard | Four stats; Missing Requirements links to Storage; approved internship, Manila date gating, attendance and completion controls. | `components/dashboard-ui/StudentDashboardStats.js`; `components/dtr-ui/DtrTodayCard.js` |
| Employer dashboard | One card per student, positions/status/date/hours inside it; filters operate on positions; five students per page. Overview statistics still count internship records. Requests are answered in Notifications. | `components/dashboard-ui/InternsSupervisedCard.js`; backend `features/dashboard/controllers/dashboardController.js` |
| Department dashboard | Tracker search, course filter and paging; distribution chart covers all active department interns. | `components/dashboard-ui/StudentHoursTracker.js`; backend dashboard controller |
| Admin dashboard | Account, placement and activity overview with links to the appropriate management tools. | `app/admin/(dashboard)/DashboardClient.js`; backend dashboard controller |
| Student My Records | Required website/social page; MM/dd/yyyy date entry; map/address/city/province review; pending edits; rejection reason and restore behavior. | `components/internship-records-ui/`; backend internship-record controller |
| Staff Records/detail | Department scope, required rejection reason, confidential work tabs, website and Google Maps link. Staff completion does not enforce the student's hours threshold. | Backend internship-record controller; `components/internship-records-ui/` |
| Company rotations | Optional for all academic departments; student-owned editing after approval; no overlap; estimated end is not a cap; disabled/finished history retained. | Backend `features/internship-rotations/`; `CompanyRotations.js` |
| DTR | Fresh position checks, approved ongoing internship and start date, breaks/resume/clock-out; student completion needs credited hours and no open shift. | Backend DTR controller; `components/dtr-ui/` |
| DTR location/sharing | Custom pin, radius 20-2,000 m, optional label; remove custom pin restores company fallback; temporary sharing differs from clock submission. | `DtrLocationFields.js`, `DtrLocationConfirmation.js`; backend locations feature |
| Weekly narratives | Coverage range distinct from submission date; optional overlapping rotation selection and saved labels; ongoing editing after start; finished reading/printing. | `components/weekly-narratives-ui/`; backend weekly-narratives and rotation policy |
| Summary reports | One report per eligible internship; starts after the saved start date; ongoing and finished reports can be selected; image/word/page limits and legacy attachments. | `components/summary-reports-ui/`; backend summary-report controller |
| Storage/requirements | One allowed document up to 10 MB; metadata/category required; supervisor upload must be accepted to satisfy a requirement; previous internship files are separate from the alumni directory. | `StorageUploadForm.js`; backend multipart and documents features |
| Supervisor uploads | One permitted certificate/supporting file up to 50 MB; pending acceptance; preview is separate from upload limits. | `components/internship-docs-ui/`; backend multipart upload policies |
| Evaluations | Student-authored supervisor feedback: one active per internship with accepted supervisor. Employer-authored performance reviews: multiple on ongoing started internship, confidential from students; author soft deletion versus staff purge. | `components/evaluations-ui/`; backend evaluations controllers |
| Internships/opportunities | Company/position search, work type/course filters, student favorites and employer-owned posting controls. | `components/internship-posts-ui/`; backend internship-posts feature |
| Supervisor requests/profiles | Request status and employer response through Notifications; public basic supervision history grouped by student does not unlock private work tabs. | `components/search-user-ui/`; backend users/supervisor-requests features |
| Notifications | Approval/rejection goes to student My Records; evaluation alerts go to record details; popup dismissal differs from saved-alert deletion; active unanswered requests cannot be deleted. | `lib/notification-routes.js`; notification components/controllers |
| Search Users/private tabs | Other-department students are Info-only for heads; profile rotation panel only for the matching head; existing administrator and accepted-supervisor permissions remain. | `PageManual.js`; backend student-profile access and users feature |
| Map/visit planning | Combined search/department/region filters; city list in Map View; student-count priorities and straight-line tie breaks; in-map company panel; road-route failure retains details; Google fallback for travel. | `components/map-ui/`; backend map feature |
| Announcements | Employers read only explicitly shared posts; optional create/edit checkbox defaults off. Ordinary heads post Department and can read General; registrar/admin post General; dated ranges feed allowed calendars. | `components/announcements-ui/`; backend announcement controller |
| Calendar | Student private tasks within saved ongoing internship dates; staff schedules and audience; employers have only the simple header calendar. Rotation date extensions do not extend task eligibility. | `components/calendar-ui/`; backend calendar controller/routes |
| Alumni Past Internships | Company/alumnus search, year/department filters and non-registrar department-head posting/editing permissions. | `components/past-internship-ui/`; backend past-internships feature |
| SIPP Annex C/D | Registrar guide only; draft editing versus submitted reports; variable row count, complete date ranges, PDF preview. | `components/sipp-reports-ui/`; backend sipp-reports feature |
| Feedback & Concerns | Category-based audience, optional ongoing/finished intern mentions, staff status/internal notes, author-only post/reply changes, attachment deletion/cleanup. | Backend `features/feedback/feedbackPolicy.js`, `feedbackService.js`; `components/feedback-ui/` |
| PDF/other document preview | PDF starts at 75%; original download stays available; complete DOCX/selected-sheet printing; 25 MB non-PDF preview cap; legacy DOC download; partial-preview notice. | `components/ui/PdfViewer.js`, `DocumentPreviewDialog.js`; `lib/document-preview.mjs` |
| Academic reference data | Department/course creation, search and active/inactive controls. | `components/departments-and-courses-ui/`; backend corresponding feature |
| Evaluation criteria | Sections/criteria, evaluation direction, deactivate/reactivate, availability for new evaluations. | `components/evaluations-ui/`; backend corresponding controller |
| Activity logs | Readable submitted/update details; individual deletion and separately previewed date-range deletion. | `components/activity-logs-ui/`; backend activity-logs feature |
| Error tracking | Groups versus occurrences, filters, latest 25 occurrences, permanent group removal, hosting-log limits. | `components/error-tracking-ui/`; backend error-tracking controller |
| Cache monitoring | Process-local backend response-cache metrics, refresh/reset meaning, estimates rather than database timing. | `components/cache-monitoring-ui/`; backend cache metrics |

## Help support contacts

Students and department heads see available administrator email addresses and phone numbers in Need more help?, loaded through role-restricted GET /help/admin-contacts. Only active, non-deleted admin accounts with usable contact details appear. Employers instead receive Create feedback instructions and a link to Feedback & Concerns. Loading, empty, failure/retry and expired-access states remain distinct. No database or environment changes are required.

## Maintenance boundaries

Keep instructions in the shared guides so Help and page info buttons update
together. Do not add proposed Activities as an available feature. Keep password
tokens, provider keys, database credentials and implementation diagnostics out of
user instructions. Manuals explain existing permissions; they never grant them.

For future behavior changes, recheck both the visible control and backend policy,
then update the relevant role guide and contextual profile text. Review role and
registrar guide filtering with `tests/help-guides.test.mjs`, and preserve rotation
read-only/error-state tests when changing its manual entry point.
