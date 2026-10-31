# Frontend agent guide

Skeleton contrast: use the shared `components/ui/skeleton` and theme-specific `--skeleton` color for neutral loading placeholders. Light `bg-accent`/`bg-muted` matches the canvas and becomes invisible during the pulse. Preserve explicit translucent-white overrides on maroon banners; do not replace them with neutral blocks. Feedback route/list loaders use the shared Skeleton too. Keep loading behavior and layout independent of these visual colors.

Dialog descriptions: retain Radix-generated description IDs in LoginLanding and confirmation dialogs. Header descriptions use DialogDescription; when the confirmation text lives in ModalForm.Confirmation, register it as DialogDescription only if there is no header description. Custom IDs on plain paragraphs can trigger Radix missing-description warnings despite visible text. Explicitly omit aria-describedby only for intentionally description-free dialogs. The above-fold Philippines map Image uses loading="eager" to avoid deferring the landing LCP image.

## Company analytics and Registrar dashboard (October 31, 2026)

`/company-analytics` is admin/non-REG-head only in layout/nav/manual and API; never expose company popularity to Registrar, student or employer. `components/analytics-ui/AnalyticsDashboard` uses viewer-scoped no-store server reads with applied filter snapshots, skeletons, retry/clear-filter errors and no stale private data on denial. Admin has department/dependent course/year/term/start-date filters; ordinary heads have only their current department and its courses. Counts use confirmed distinct student/company pairs, not postings/applications or duplicate placement rows. Name normalization combines case/whitespace and same-name branches, not aliases. Most/least exclude zeros; zero-match directory is separate. Ongoing precedence makes status columns additive to company counts. Distinct global students can differ from pairs; monthly pairs can recur and are not additive across months. Preserve the displayed period, metadata disclosures and backend model definition.

Registrar `/department_head` now renders the SIPP-only overview; remove the old nested-layout redirect to SIPP. Keep Dashboard navigation for REG but no Company Analytics link. Only authorized Annex C statuses/report activity and Annex D student/course/department coverage are shown; no invented verification/document queues, private DTR/evaluation summaries or company ranks. Default/reset Registrar year follows the existing SIPP current-year helper, and cards pass validated year/tab/status into the existing SIPP managers. Do not change Annex exports or expand staff access to them. Regular dashboards retain their current content plus an analytics link.

Reuse DashboardStats (one phone column), ChartContainer/Recharts and tap tooltips, min-w-0 containers, DropdownFilter full-width mobile controls, local table overflow and existing react-to-print. CSV/PDF export full filtered ranked and zero lists, not the paginated slice; guard CSV formulas. Current/latest academic membership is not historical membership. Registrar follows the existing official Annex D population; company counts exclude deleted accounts. Backend SQL verification migration is read-only with no env/package/schema/backfill changes. Guides are in `analyticsGuides.js`, detailed handoff in `docs/analytics-dashboards.md`; deploy the paired backend before frontend.

## Announcement student tags (October 31, 2026)

The create/edit form now uses DropdownFilter for **Audience**, default usual department/General, with `tagged_students_only` hidden0/1. Targeted mode must retain at least one selected student; backend validates the merged state. Restore audience on edit, keep multi-selection across search, show the targeted badge, and explain that admins retain read access without automatic alerts. Targeted viewing is limited to tagged students/current heads/author/admin plus opted-in supervisors. The previous unchanged-school-audience rule below applies only in usual mode. Apply paired backend targeted-audience migration after student-tags migration. The backend also gates calendar/notification paths and uses private/no-store reads for current membership; keep existing announcement change events/invalidation.

`AnnouncementStudentTags` is shared by create/edit. It uses a viewer-scoped, debounced lookup with skeleton/error/retry/empty states and preserves/removes up to 100 selected UUIDs across searches. Serialize the hidden `tagged_student_ids` JSON array in existing form actions; restore IDs/names from read/edit metadata. Regular heads select only their department's ongoing interns; admin/Registrar heads select all ongoing interns, with backend revalidation. Checked employer visibility + tags means only current tagged supervisors; checked without tags means all employers; unchecked means no employers. Show this distinction explicitly and never imply that tags restrict the ordinary school audience. Backend live read/open predicates are authoritative. Keep employer cards read-only, notification refresh behavior and Calendar exclusion. Apply paired backend October 31 announcement-tag migration first; no frontend env/package changes.

## Bulk DTR location assignments (October 30, 2026)

`/dtr-locations` uses `components/dtr-locations-ui/` and authenticated `lib/server-actions/bulk-dtr-actions.js`. Admins manage all ongoing interns with department/dependent course filters; heads manage current-department ongoing interns with course filtering, excluding `REG`; employers manage only ongoing records assigned to them as supervisor. Hide nav/manual/page access for students and Registrar heads; the backend independently rechecks current database membership on every read/write. Do not trust selections or JWT department snapshots as record authority.

Use internship IDs for persistent in-page selections (limit 100); header Select all means only the current ten-row page. Keep selected avatars/name/count/remove/clear controls and preserve selection across filters/pages. Confirmation captures the exact IDs and draft location/radius, states that custom locations are replaced, and prevents duplicate submits. Clear successful/unchanged selections only, retain per-record failures. Never silently retry an unconfirmed write; refresh first. Keep route/table/map-import skeletons, retryable read failures, and mask cached data on 401/403.

Blue saved pins group effective custom or company-default locations by eight-decimal coordinates within authorized current filters across pages; show only those scoped names/avatars/counts/radii. Company fallback is included in pins and labeled in the table/popup (150 m). Maroon draft pin/radius uses the existing MapForm/search/reverse-geocode behavior; MapForm's optional children slot hosts saved pins without changing other map forms. Address/note are max 255, radius a whole number 20–2,000 m, default 150. Attendance still uses the same per-internship override at clock-in/out; do not modify company coordinates, hours, old DTRs or dates.

Viewer-scoped `bulk-dtr-locations` reads refresh after writes, focus and verified socket events. `dtr_location_set` refreshes the relevant viewer's bulk map, dashboard and profile/record reads; `dtr_locations_changed` refreshes the actor's page. Students receive each committed change; staff actions also group notices once per supervising employer. New location notification links are fixed `/student` or `/dtr-locations`, with legacy alerts falling back to Notifications. No student identity may be sourced from unscoped pin data.

The page manual and `/help` share `guides/bulkDtrGuide.js`; keep role limits, selection scope, reassignment and notifications accurate. Read `docs/bulk-dtr-locations.md` for setup/workflow. No dependency/env/schema changes; backend SQL verification migration documents reuse of unique `dtr_locations.internship_id` and existing notification type. Deploy paired backend/frontend changes together.

- Employer dashboard InternsSupervisedCard now consumes grouped students with a placements array from both the overview seed and paginated intern endpoint. Page five unique students before reading their matching placements, scoped to the logged-in employer and status filter. Show name/course/email/profile once and each position/status/date/hours separately. Keep request actions in Notifications. Dashboard stats retain their existing placement counts. List and employer overview cache keys include a grouping version; deploy frontend/backend together.

This guide applies to this frontend repository and its descendants. It records the frontend behavior established during the current project work, as of October 30, 2026. Use it as a handoff and a list of behavior to preserve. Check the current implementation before changing a contract; historical test counts and screenshots do not prove current deployment behavior.

## Project structure and runtime

- Next.js App Router, React, Tailwind CSS v4, shadcn/Radix components, next-themes, Lucide icons, Sonner action toasts, and TanStack Query.
- React-Leaflet/Leaflet and OpenStreetMap power the interactive maps. The landing-page Philippines illustration is a separate SVG feature.
- Server-generated reports use HTML templates and Puppeteer/Chromium. React-PDF/PDF.js displays and prints the resulting PDFs; it does not replace the report generator.
- Node engine requirement: `>=24.22.1 <25`, recorded in both `package.json` and `package-lock.json`. This baseline was updated for the Node security patch. Do not silently lower it.
- Application routes, loading/error boundaries, and API handlers live in `app/`. Feature components live in `components/`; shared UI in `components/ui/`; query definitions in `lib/cache/`; backend requests in `lib/server-actions/`.
- Shared styles: `app/_styles/globals.css`. Root providers: `app/layout.js`.
- Next.js 16 authentication entry point: `proxy.js`. API routes excluded from its matcher must enforce their own authentication and authorization.

Commands:

- `npm run dev`: development server.
- `npm test`: Node test suite.
- `npm run lint`: ESLint.
- `npm run build`: production build; `npm start`: run the built app.
- `npm run prod`: build and start.
- `npm run prepare:pdf-preview`: prepare local PDF.js assets. Install/dev/build/prod hooks normally run this automatically.

## Environment and backend boundaries

- Keep secrets server-side. Never print credentials, commit local environment files, or move server secrets into public variables.
- Existing settings include server-side `API_BASE_URL`, public `NEXT_PUBLIC_SOCKET_URL`, and server-side `ACCESS_TOKEN_SECRET`. Preserve their existing purposes.
- `lib/api-base-url.mjs` normalizes the backend base URL to the canonical API version and supports the existing legacy deployment paths. Preserve validation and reverse-proxy prefixes.
- The map routing, PDF preview, print fixes, and Node patch do not require new frontend environment variables or API keys.
- Hosted Node versions must be checked independently. A platform-specific Node override can take precedence over package engines. Local version output does not verify the deployed runtime.
- Frontend visibility rules supplement backend authorization. Never treat a hidden button or filtered query cache as access control.
- Changes involving database columns or API filtering need the corresponding backend deployment. Do not execute migrations or backfill live records merely because this guide mentions them.
- The user previously chose to supply a SQL export instead of authorizing inspection of the live database. Do not infer live database access from that export.
- Do not infer successful production routing, deployment, or visual PDF verification from localhost tests.

## Shared UI, mobile layouts, and form errors

- Reuse the project's shadcn Select, dialog, button, and field components. Maintain light/dark theme contrast and keyboard/accessibility behavior.
- Keep wheel and trackpad scrolling browser-native across the landing page and role layouts. Do not restore a document-level wheel interceptor: it made an outer page scroll when an `overscroll-contain` inner list reached its boundary. Preserve each component's native scroll area, Leaflet wheel zoom, and CSS smooth behavior for programmatic navigation.
- Preserve responsive layouts and matching loading skeletons when changing a page.
- `components/ui/ModalForm.js` and `lib/modal-form-validation.mjs` handle required-input feedback before submit controls can close a dialog.
- ModalForm validates both click capture and submit, including keyboard submission. It uses the existing action error toast, focuses/scrolls to the first invalid control, and preserves the open form and entered values.
- Required whitespace-only values and native email/number/date/file/pattern constraints are checked. Disabled controls and disabled fieldsets are skipped. Optional inputs remain optional.
- Explicitly required hidden inputs support custom Select values. Use `data-validation-label` and `data-validation-focus` to associate errors with a visible control.
- Required checkbox groups use `data-required-group` and can provide `data-validation-message`.
- Keep server validation. Do not blanket-remove DialogClose, native constraints, or existing confirmation workflows.
- This shared behavior covers past internship, announcement, internship post, narrative, upload, calendar, activity-log range, and department/course forms that use ModalForm. Raw evaluation forms retain their server/action validation.
- Required controls added during the fixes include past internship course, announcement category, eligible internship courses, storage upload metadata/file, requirement selection, and department/course editor fields.
- `lib/toast-and-action.mjs` keeps the loading indication until the action settles, replaces that toast on success/error, handles thrown failures, and keeps concurrent actions' toast IDs separate. Reuse the styled action error helper rather than adding inconsistent alerts.

## Reads, query caching, errors, and pagination

- Central API error handling lives in `lib/api-response.js`. Preserve safe messages and distinctions between authentication, authorization, throttling, and server failures.
- Never convert a failed read into a successful empty array. Initial loading, empty data, initial failure, and background-refresh failure are different UI states.
- `components/ui/ErrorUI.js` supplies shared full/compact retry states. Keep cached content visible during refresh or next-page failures.
- Scope query keys to the relevant user, record, filters, and tab. Clear sensitive query state on logout/account changes. Do not reuse another account's cached records.
- Preserve search debounce and all selected filters when fetching another page or returning to a cached view.
- `lib/see-more-pagination.mjs` reconciles first-page refreshes with later loaded pages only when ordering, totals, and query identity remain compatible. De-duplicate stable IDs and reset stale page offsets after writes.
- Use narrow feature/record invalidation after mutations and socket events. Avoid replacing all caches or refetching unrelated features.
- These patterns cover admin tools, announcements, accounts, records, posts, notifications, past internships, calendar, map, profiles, storage, DTR, narratives, reports, and record-detail tabs.

## Landing page and animated Philippines illustration

Primary files: `components/auth-ui/LoginLanding.js`, `components/auth-ui/PhilippinesNetwork.js`, and `public/philippines-network-map.svg`.

- Keep the landing page specific to MSEUF-CI/Candelaria and its internship workflow.
- Preserve the compact hero spacing, blended map illustration, and readable dark-mode step numbers.
- The landing illustration uses Philippine city pins, including Manila. The proposal to replace those pins with regions was canceled.
- Its coordinates are illustrative; do not confuse its projection with the precise campus routing origin used on /map.
- Preserve the existing logo-to-pin transition.
- Recurring string groups use random unique routes, 2?5 per group, approximately 1,800 ms lifetime and 1,700 ms group interval. The 100 ms overlap gives a continuous flicker rather than a complete blink.
- Avoid immediately repeating the previous group, bound active routes, and clean up timers.
- Respect prefers-reduced-motion, including preference changes while mounted. Do not force animation on users who have reduced motion enabled.

## /map: visit planning, filters, and company details

Primary directory: `components/map-ui/`. Detailed routing notes: `app/api/map/README.md`.

- Preserve the original search across students, companies, and courses, together with the region filter.
- Cities belong beside the map in the same Map View, rather than a separate Cities tab. Keep the Companies view.
- Desktop uses a narrower map with a city sidebar. Small-screen controls remain compact so the map is reachable without scrolling through planning cards.
- City/municipality groups show unique student counts across departments within the active search, region and department filters. Expand groups to show companies and student names.
- Preserve city/province normalization and keep unclassified records discoverable.
- Recommendations prioritize cities with more distinct students. Ties use proximity to the nearest company from the selected origin, then the existing deterministic company/name tie breakers.
- Clearly distinguish straight-line proximity from road distance/travel time. Recommendations are visit priorities, not a solved multi-stop itinerary.
- Use the shadcn Select for city sorting. Mobile tabs and region controls span the available width.
- Planning dialogs use compact, flat content and short explanations rather than several nested bordered cards.
- Selecting a company opens a left slideout inside the map on both desktop and mobile.
- The mobile panel is narrow enough to leave map context visible, covers the full map height, and scrolls internally.
- Keep the small reopen icon inside the map. Do not restore the duplicated company/route panel below it.
- Clicking Show road route keeps the panel open while loading and after failure. Close it only when that request succeeds.
- Guard against an old route response closing a panel for a subsequently selected company.
- Keep the /map skeleton consistent with the current filters, map/sidebar arrangement, and compact mobile controls.

### Road routing and fallback

- Precise MSEUF-CI route origin: latitude **13.9304557**, longitude **121.4312752**. Leaflet uses latitude/longitude; OSRM URLs use longitude/latitude.
- Display successful road geometry using React-Leaflet. Keep the Google Maps directions link available as a backup with the correct selected origin and saved destination.
- Use authenticated GET /api/map/route/:internshipId. Do not put route reads back through the browser's Server Action queue.
- Destination, active internship, and staff access are checked against the backend. Do not accept arbitrary client destination/provider URLs as trusted route inputs.
- The default flow tries the fixed public FOSSGIS OSRM service in the browser, then one same-origin server_route=1 fallback for eligible provider/network failures.
- Access denial, expired access, or a genuine NoRoute response must not trigger repeated provider fallbacks.
- Public provider calls send coordinates without cookies, access tokens, or account credentials.
- Preserve separate bounded lookup/provider/fallback deadlines, safe stage/code errors, queue limits, and response-body timeouts. Every failure must end loading.
- Never draw a straight line and label it a road route.
- Campus route cache hits require fresh backend authorization and destination checks. Live-location routes bypass shared route caching.
- The fallback queue/cache is per function instance, not a distributed production rate limiter.
- Public-provider connectivity remains best effort; preserve Google Maps fallback. See the map README for precise deadlines and limits.
- The existing backend route preparation contract is required. A dedicated provider can use the backend's optional routing configuration; that is not a new frontend API key.

### User location and sockets

- User location is opt-in and requires browser permission and a secure context (HTTPS or localhost).
- Current behavior polls getCurrentPosition, waiting approximately 10 seconds after each read; it is not continuous watchPosition or turn-by-turn navigation.
- Preserve high accuracy, maximumAge 0, and a 15-second location-read timeout.
- Update the blue position marker from fresh fixes. Expire stale location after approximately 45 seconds.
- Refresh an active route origin only after both the movement threshold (100 m) and time threshold (30 seconds) are met.
- Existing map_location:update and map_location:position events are scoped to the authenticated user's map session. Do not broadcast private viewer coordinates or persist a movement history.
- Browser location still works when the socket is disconnected. Clean up timers, listeners, and session state on stop/unmount.
- Initial positioning centers the map once; Locate me recenters manually. Do not silently turn this into an always-following vehicle navigator.
- Google Maps is the intended option for in-vehicle navigation.

### Location search inside Leaflet forms

- `components/map-ui/MapSearchControl.js` configures Philippine location search with the existing 1,000 ms autocomplete delay and minimum three characters.
- Show loading inside the actual GeoSearchControl during both debounce and request, not only in an unrelated React wrapper.
- Hide stale results and use request-version guards so an older request cannot clear a newer spinner.
- Reset, Escape, selection, and unmount must clear pending UI and listeners.
- Preserve map selection, address, coordinates, city/province, and region behavior.

## Announcements and calendar permissions

- Employers have read-only Announcements navigation/help/direct-page access, but backend feed/count/pinned/UUID/legacy-link reads require visible_to_employers = 1. The create/edit checkbox is optional and defaults off; existing rows remain hidden. Admin and department-head category/author management rules are unchanged. Unchecking revokes employer access, removes employer announcement alerts and refreshes their caches via announcements_changed; granting visibility sends employer alerts without duplicates. Apply backend scripts/2026-10-30-announcement-employer-visibility.sql before deployment.
- Ordinary department heads can post **Department** announcements only, while continuing to view General announcements.
- Registrar department heads (department_code REG) and administrators use **General** posting.
- Use actual category IDs resolved from category data. The form shows the permitted category and submits its ID; do not infer IDs from display ordering or expose prohibited choices.
- Apply the same restriction when editing legacy announcements.
- Preserve optional event date ranges, inclusive calendar display, single-day events, and validation that end requires start and cannot precede it.
- Linked announcement notifications must preserve the existing pinned/normal feed ordering; do not prepend a duplicate target card.
- Employers keep the header calendar icon/month popup, but no route/link to /calendar and no direct full-calendar access.
- Do not expose announcement calendar entries through the employer popup.
- Keep existing private calendar to-dos, schedules, and allowed-role calendar behavior.

## Internship records, start dates, and DTR

- The student record form's start/estimated-end controls display and accept MM/dd/yyyy with date-fns and calendar selection. Keep ISO yyyy-MM-dd in named form fields/API payloads; reject impossible/incomplete dates without submitting a previous valid value. Preserve disabled/read-only fields and draft reset behavior.
- Company website is required on new student internship submissions and pending placement edits. Accept official websites/social pages, including bare domains normalized to HTTPS by the backend. Staff Overview includes the saved website; open only HTTP(S) links without embedded credentials, and display `-` for legacy records without one. Keep old records readable and ongoing records locked. No SQL backfill or new environment variables are required.
- Pending internship records can be edited using the prefilled record form. Keep existing locks for ongoing/finished/rejected records.
- `components/internship-records-ui/internshipRecordFormData.mjs` normalizes and limits editable fields. Do not overwrite unrelated record data.
- New location data includes saved city/province alongside address, coordinates, and region. Preserve legacy display fallbacks and current backend validation.
- `lib/internship-start.mjs` and the shared access hook gate narrative creation/editing, summary report creation/editing, and employer submission of a student evaluation until the internship start date.
- Compare dates using the Asia/Manila calendar day; unlock at midnight of the start date. Missing/invalid dates fail closed.
- Refresh the gate on time/focus/visibility changes. Existing history remains readable. Backend checks remain authoritative.
- DTR uses Manila time. Acquire a fresh accurate geolocation fix at clock submission, rather than reusing the position captured when a modal opened.
- Preserve the geofence, assigned work location, meaningful backend error messages, and break/resume/finish confirmations.

## Evaluations: confidentiality and lifecycle

Primary directory: `components/evaluations-ui/`; actions: `lib/server-actions/evaluations-actions.js`.

- Terminology matters: Performance Evaluation is the employer evaluating a student (student-evaluation API). Supervisor Evaluation is the student evaluating their supervisor/employer.
- Students must never see employer performance scores, including through cached summaries, record tabs, print actions, or notification navigation.
- Students retain access to their own supervisor feedback. The submitting employer and authorized department head/admin can view/print performance evaluations within backend-enforced scope.
- Posting is immediate: no pending/posted status selector and no extra posting confirmation.
- Allow multiple employer-authored performance evaluations per ongoing internship record for all departments. Do not require deletion of earlier reviews or enforce automatic 200-hour milestones. Student-authored supervisor evaluations retain one active entry per internship.
- `EvaluationPostingGuard` must fail closed while eligibility is loading or failed. Backend assignment/start-date authorization remains required in both directions; atomic uniqueness applies only to student-authored supervisor evaluations.
- Author deletion is a soft delete using deleted_at. Hide only that evaluation from its author. Student-authored supervisor feedback may be replaced after deletion; employer performance reviews can already repeat without deletion.
- Authorized staff retain deleted history with a Deleted label.
- Staff permanent deletion is available only for evaluations already soft-deleted, within the existing access rules.
- Employer evaluation notifications target /internship-records/[internshipId], not a student profile ID. Refresh the relevant evaluation data on notification actions.
- Database lifecycle/uniqueness migrations belong to the backend. Apply `scripts/2026-10-29-multiple-performance-evaluations.sql` to drop only `uq_student_evaluation_active_slot`; retain `uq_employer_evaluation_active_slot`. Do not replay the older consolidation migration afterward or reintroduce status requirements.

## Weekly narrative coverage dates

Primary helper: `lib/weekly-narrative-dates.mjs`; forms/cards: `components/weekly-narratives-ui/`.

- date_from and date_to represent coverage dates, separately from submission/created dates.
- Require both dates on create/edit. Allow the same day, reject partial/invalid/reversed ranges, and constrain/reset the end when the start changes.
- Show coverage in narrative cards and full previews, as well as the printed journal.
- Print the saved coverage dates. Do not manufacture a week range from created_at for legacy records.
- Legacy narratives with no coverage remain blank/unset until edited or deliberately backfilled.
- The corresponding backend date columns/migration are required. Supplied dummy/backfill SQL is not authorization to execute against live data.

## Uploads, storage, and document access

- `lib/upload-request.mjs` provides bounded upload requests and safe timeout/network errors.
- Preserve upload loading indications. The action toast must settle on returned failure, thrown failure, or timeout instead of spinning forever.
- Upload requests have a bounded request timeout and an outer confirmation guard. A timeout means the final commit may be unknown; advise refresh and reconcile storage instead of reporting success or creating duplicate retries.
- Keep native FormData boundaries; do not manually set multipart Content-Type.
- Preserve the fixes across student storage, employer certificates, and summary attachment flows.
- Authorized stored PDFs use the shared preview rather than automatic download. Office/text/image documents now use the shared document preview described below.
- Pass the correct file ID and any required internship/target student identifiers when requesting signed document access.
- `components/internship-docs-ui/documentPermissions.js` centralizes document action permissions.
- Students may delete their own documents under the existing ownership rules, including accepted employer uploads associated with them. Approval is restricted to eligible pending employer documents.
- Employers may delete their own pending upload, not an already accepted document.
- Preserve administrator permissions and do not add broader department-head document permissions.

## Printable templates, assets, and dates

Detailed measurements and source-template notes: `app/_services/templates/PRINT_TEMPLATES.md`.

- The reference documents are Narrative, Summary Report, registrar HTE forms (Annex C/D), and Evaluation. Preserve Times New Roman, measured font sizes, spacing, margins, wording, and page orientation.
- Journal/summary use A4 portrait with 1 cm margins, 12 pt body text and the established heading/paragraph styling.
- Evaluation uses A4 portrait, 1-inch margins, the request letter and evaluation layout, including repeating letterhead and scale/category content.
- Annex C/D use legal landscape, the established maroon school heading, and their measured title/table/signature typography.
- Embedded Times New Roman assets are in `app/_services/templates/printFontAssets.js`. Do not depend on an external font CDN or a particular Windows font installation.
- Use the original LOGO_BASE64 from `app/_services/pdfAssets.js`. Do not replace it with Word-extracted gradient/background artwork.
- School seals must fit entirely inside normal-flow header space. Do not use negative positioning or clipping that cuts the logo in Annex C/D or evaluation prints.
- Annex C/D row counts are dynamic: render actual content only, with no fixed minimum blank rows. Support both small and large datasets with pagination.
- `lib/annex-d-dates.mjs` formats duration dates in both the Annex D screen and PDF as full month/day/year on both ends, e.g. August 30, 2026 - October 10, 2026.
- Preserve date-only parsing without timezone shifts, Present for ongoing records, and safe invalid-date display.
- Preserve summary attachment/memorabilia handling and existing content/page limits.
- Export endpoints remain authenticated and return private, no-store responses with useful filenames and bounded safe generation errors.

## Shared React-PDF preview and printing

Implementation notes: `components/ui/PDF_PREVIEW.md`.

- The root `PdfPreviewProvider` supplies one preview dialog for generated reports and authorized stored PDFs.
- Preview opens while preparing and offers retry, page navigation, zoom, Print, and Download. Default zoom is **75%**; preserve the existing fit-width control behavior.
- `PdfViewer` loads on the client. Serve PDF.js worker/fonts/cmaps/wasm/color profiles locally using assets matching the installed PDF.js version.
- `scripts/prepare-pdf-preview.mjs` generates ignored files under public/pdfjs. Keep install/dev/build hooks; do not add a third-party viewer service or API key.
- Validate PDF bytes before rendering and preserve safe error messages, bounded preparation, cancellation, and latest-request guards.
- Load/generate once per successful preview. Download and print reuse the loaded bytes rather than generating another report.
- Downloads preserve the original PDF. Office/text/image files use the shared document viewer; generated reports stay PDFs.
- Print every page, preserving individual dimensions and portrait/landscape orientation, rather than only the currently previewed page.
- Critical font fix: PDF.js registers embedded fonts in the viewer document. Render page canvases there, then send completed page images to the print iframe.
- Do not render text canvases under the print iframe's ownerDocument: this caused square/box glyphs when printing.
- Await page rendering/image decoding before calling print. Bound canvas resolution/memory and clean up iframe, image, and object URLs after print, abort, close, or navigation.
- External PDF links use safe new-tab behavior. Preview must not weaken evaluation/document authorization.

## /past-internships filters

Primary component: `components/past-internship-ui/PastInternshipsPageContent.js`.

- Combine existing alumni/company search with academic-year and department filters.
- Use the shadcn Select. The all/default department label is **Departments**.
- Individual department choices display acronyms/codes such as CCS and CITHM, with a name fallback if no code exists.
- On small screens, academic year and department share one row with equal-width, full-width triggers; search stays on its own row.
- Keep other uses of the shared academic-year component unchanged unless explicitly requested.
- Department choices come from the backend metadata and remain available when current results are empty.
- departmentId belongs in the query key and every paginated request. Reset page position when filters change, and invalidate relevant variants after mutations.
- Backend filtering must apply before company pagination and also to the nested alumni query so counts/details match. This feature required frontend and backend deployment, not a new database column.
- Keep page and Suspense skeleton layouts synchronized with the filters.

## Other established frontend behavior

- Employer Info profiles mount EmployerSupervisionHistory as a sibling card below ProfileInfoGrid for all signed-in viewer roles, only for employer targets. Show ongoing/finished non-deleted placements grouped into one card per student, five students per page, using viewer/employer/page-scoped queries and a matching skeleton. Hide a successful empty card; expose read/retry failures, retain transient cached data but mask it on 401/403/404. Link only to student profiles, preserving their private-tab guards. Do not expose email, duty hours, evaluations or documents, or reuse the employer-only dashboard endpoint. List all ongoing and completed positions, companies and dates within each student card. The backend paginates students before loading placements; the query key includes by-student-with-current to avoid legacy flat cached data. See backend GET /searched-user/:searchedUserId/supervised-interns; no SQL/environment/package changes.
- `/help` guide cards open the shared Modal with summary, ordered steps and destination link; do not restore inline details/summary accordions. Preserve role/registrar restrictions, step-text search and shared guide identity with page manuals. The Accounts guide follows role-card selection, role-specific fields/preview, mandatory email, invitation setup, pending state and resend.
- `lib/notification-routes.js` centralizes notification targets. Preserve encoded IDs, relevant record/profile tabs, schedule destinations, and announcement feed targeting.
- Student `internship_record_approved` notifications open `/student/internship-record` from the inbox, header dropdown and live toast, including old read/unread items. Invalidate only the viewer's student-records query before opening so cached pending data refreshes. Other toast types keep the inbox entry point; preserve announcement click-time checks and popup-only dismissal. Unread dark-mode cards/dropdown entries and live toasts use a subtle maroon/card mix; read cards retain their normal background.
- `lib/favorite-toggle-sync.mjs` reconciles rapid favorite toggles without letting an older response overwrite newer intent.
- Account creation requires a valid email address for every new role in both the form and backend. Trim email before duplicate checks/storage; reject blank, non-string and malformed values. Middle initial stays optional. Preserve the responsive form/preview and role-sensitive department/course assignments; do not display undefined name fragments. Existing accounts without email are not modified. New accounts use EmailJS invitation-only setup: no password field/shared default; backend inserts pending accounts with a random unusable placeholder. Preserve pending/completed labels, resend and committed-account/unconfirmed-delivery feedback. Public /set-password accepts an emailed token; only successful completion leads to normal sign-in. Setup-only legacy recovery tokens must not enter ordinary session helpers or private pages. Apply backend scripts/2026-10-29-account-invitations.sql and configure EmailJS on the backend; keep existing users usable.
- Role-aware help content must agree with actual calendar, announcement, evaluation, and document access.
- Admin cache diagnostics compare compatible snapshots from the same server process and reset comparisons after restart; unavailable metrics are not zero.
- Error-tracking deletion/count/pagination updates must reflect confirmed server results and preserve useful cached content on refresh failures.
- Activity-log bulk deletion keeps date-range preview separate from delete confirmation. Retrying a preview must not delete records.
- Dashboard/socket updates use appropriate cache invalidation without discarding unrelated data.

## Verification and handoff expectations

Use the relevant existing tests under `tests/`. Important groups include:

- `tests/modal-form-validation.test.mjs`, `tests/toast-and-action.test.mjs`.
- `tests/past-internship-department-filter.test.mjs`.
- `tests/evaluation-lifecycle.test.mjs`, `tests/confidential-evaluations.test.mjs`.
- `tests/internship-start-access.test.mjs`.
- `tests/weekly-narrative-dates.test.mjs`, `tests/weekly-narratives-template.test.mjs`.
- `tests/notification-routes.test.mjs`, `tests/favorite-toggle-sync.test.mjs`.
- Map tests cover visit planning, filter preservation, routing HTTP/request behavior, live location, and company/mobile panels.
- PDF tests cover preview/download, stored documents, runtime, font/template references, and narrative/summary output.
- Other suites cover API errors, role-specific error UI, pagination, pending record edits, document permissions, DTR/geolocation, and uploads.

Run checks appropriate to a functional change and report what actually ran. Documentation-only edits do not require rebuilding the application. Do not add low-value tests that merely repeat implementation text.

The prior full frontend suite passed 260 tests on Node 24.22.1; this is a historical snapshot, not a fixed required test count. Some older feature documents contain earlier counts.

Windows permissions previously blocked headless-browser/Word visual checks and some .next writes/junction creation. A prior build pass does not validate every later state. Distinguish automated/unit checks from actual visual PDF, interactive browser, production build, and deployment verification.

For handoffs, identify frontend files changed, any required backend contract/migration or deployment, checks performed, and material limitations. Preserve unrelated local work.

## Feedback & Concerns (/feedback)

- Employers create structured posts with category, subject, description, optional internship tags and up to three 5 MB PDF/image attachments. School staff reply and manage status; students have no route, navigation, API, or attachment access.
- Internship Feedback & Concerns supports individual or select-all supervised internship tags. Platform/technical/general posts have no tags. General Feedback is shared with all department heads and Admin; Platform Feedback and Technical Issues are limited to the author and Admin.
- Author and Admin see a post. All department heads see General Feedback; for Internship Feedback & Concerns, a stored mention must match their current department membership. Department heads cannot access Technical Issues or Platform Feedback, even if legacy mention rows exist. Multiple departments share the full discussion. Preview the audience before posting.
- Department/student labels are snapshotted when posted from eligible internships and their latest academic department. Authors may edit tags. Existing links retain their snapshots; newly added internships must still belong to that employer.
- Notify each relevant head once per post even when several interns share a department. Notification links open /feedback?post=UUID; socket updates invalidate only this user's feedback queries.
- Desktop uses feed plus thread; mobile opens a full-screen thread with a back button. Keep filters/composer responsive and preserve search, pagination, error/retry and pending action states. Reuse FormDialogContent and ModalForm fields/buttons for the composer, and the shared DropdownFilter and SearchBar for feed filters.
- Staff-only internal notes must stay absent from employer reads, pagination, notifications and feed timestamps. School staff alone update Open/In review/Resolved status; reopen before replying to a resolved discussion.
- Backend authorizes every list/detail/reply/status/attachment request; query keys include user identity. Hide cached private details after an authorization denial.
- After creation, cancel older reads and seed the author-scoped feed/detail cache with the committed backend detail. Reset search/category/status and pagination to show the new post on page one, then explicitly refresh. Preserve counts/deduplication, invalidate other cached filters, and work without WebSocket delivery. Older backends returning only an ID use an authorized detail read before seeding.
- Feature source: components/feedback-ui/, lib/server-actions/feedback-actions.js, lib/cache/feedback-queries.js. Tests: tests/feedback.test.mjs.
- Apply the backend docs/feedback-and-concerns.sql before deployment; use its docs/feedback-and-concerns.md for the API/storage contract. Existing private storage bucket and environment settings are reused. No live migration was executed during implementation.

- Feedback authors alone can edit/delete their own posts, and reply authors alone can edit/delete their own replies. Use the existing pencil/trash and form/confirmation UI. Edits may retain/remove files and add replacements within the three-file limit.
- Keep the discussion container overflow-hidden so its footer respects rounded corners. Show images inline; use shared React-PDF preview for PDFs and require an explicit download action.
- Existing installations require backend docs/feedback-author-actions.sql before deployment. It adds private/public reply revision counters and the durable file-cleanup queue. Deletion removes storage objects after commit; failed removal retries automatically, without losing the queue row. No live migration was run.
- Reply revisions prevent cached edited/deleted replies from reappearing. Internal changes affect only the staff-visible revision, and paginated history must discard pages belonging to an older revision.

## Help and page manuals

- Role guides in components/help-ui/guides/ are shared by /help and the page info dialogs through HelpManual and getHelpSections/getPageGuide. Update the shared guide when changing a workflow; do not duplicate instructions in separate modals.
- Preserve role and registrar filtering: students have no Feedback guide, employers have no full Calendar link and can read only opted-in Announcements, and registrar accounts use SIPP Reports instead of the department dashboard/Records guides.
- Manuals remain useful in empty or locked states. They explain eligibility without exposing unavailable actions. Use ManualDialog for scrollable mobile dialogs and its existing accessible info trigger.
- Feedback manuals distinguish employer authors from staff: category audiences, tagged-student notifications, internal notes, status/reopening, author-only post/reply changes, attachment previews, and actual file deletion must match the implementation.

## Dashboard summary cards

- All role dashboards use a single stat-card column below sm, two columns from sm, and the existing three/four columns from lg. Keep DashboardStatsSkeleton and student loading states synchronized.
- The student fourth card is Missing Requirements, linked to Storage. The backend counts distinct before/after requirement categories lacking a student/accepted document on the current ongoing non-deleted internship. Pending employer uploads do not satisfy requirements. No ongoing internship is a separate state from zero missing requirements.
- Document mutations invalidate the student's dashboard overview as well as document queries. No new database columns are needed for this count.

## Office and non-PDF document previews

- PdfPreviewProvider exposes previewDocument alongside the unchanged previewPdf API. Only one modal is open at a time, and route changes/close cancel reads and release private file state.
- Shared authorized actions cover student Storage/current and past files, profile certificates, staff record documents, and legacy summary attachments. Preserve file/record/student authorization before requesting a signed URL; never send app credentials to storage.
- DOCX uses docx-preview in a sandboxed, offline iframe. Disable alt chunks/comments, use embedded data URLs, sanitize links/active content/remote CSS before printing, and preserve document styles within the content root. Legacy .doc files retain an explicit original download.
- XLS/XLSX/CSV use the maintained SheetJS CE distribution pinned to its official CDN in package.json/lock. .npmrc permits only root URL dependencies for reproducible npm 12 installs. Do not replace this with the outdated public-registry xlsx package.
- Parse spreadsheets and validate Office archives in a cancellable worker. Render cells as text, never HTML, links or executable formulas. Select a sheet to preview/print its saved values. Preview limits (25 MB, 1000 rows/100 columns, 150 Word pages) must be explicit, and printing partial data is disabled.
- Use react-to-print for non-PDF content only; print Word documents in full, spreadsheets one selected sheet. Default zoom is 75%; preview zoom is outside the printed content. Wait for fonts/images and clean up on close/failure. PDFs retain the existing canvas/font printing fix.
- Always keep Download original file available after a parsing failure/unsupported type. Successful previews reuse the original bytes. Read failures offer an explicit reauthorized original download; do not start downloads automatically.
- No new backend, database, environment variable or third-party document-viewing service is required. Tests include office-preview.test.mjs and student-storage-download.test.mjs.

## Readable activity logs

- lib/activity-log-display.mjs supplies shared action/module labels and read-only legacy description formatting for the admin log, filters/summary cards, and all four dashboards. Preserve stored action/target codes and metadata identifiers for filtering and audit history.
- Backend insert descriptions should identify the affected person, company, post, or report in plain language. Keep field names/IDs in structured metadata, rather than appending raw changed_fields lists to descriptions.
- Expand update details with readable field labels. The list describes fields included in the update, not a claimed before/after diff. Do not expose unfiltered metadata or raw course IDs as submitted details.
- Legacy formatting is scoped to known templates and suffixes; do not rewrite arbitrary user content or modify historical database rows. Preserve role permissions, transaction behavior, and cache invalidation.

## Supervisor-request notifications

- The employer dashboard retains the original Interns You Supervised card with All/Ongoing/Completed filters and accepted assignments only. Pending requests are handled in Notifications, not in the dashboard.
- Use the response confirmation, loading/error action toast and useSupervisorRequestResponse hook in Notifications. Failed writes retain retry controls. Confirmed responses refresh this employer's overview, intern pages, notifications and relevant profile queries without depending on WebSocket delivery.
- Unanswered active supervisor-request notifications have no delete button in either the inbox or header dropdown. The backend enforces this even for direct calls. Responded, cancelled/superseded and no-longer-actionable alerts can be dismissed; marking read does not count as responding.
- Backend deployment is required; no new database columns or environment variables. Tests: employer-supervisor-requests.test.mjs (frontend) and employer-supervisor-requests.test.js (backend).

## Search Users department scope

- Department heads viewing a student from another department receive Info only. DTR, narratives, evaluations and file/location tools require a positive current-department permission; missing permission fails closed.
- The profile API supplies user.permissions.canViewStudentRecords from current database membership using the student's latest academic row and the head's assigned department. Do not compare display names or trust stale JWT department claims.
- Server-rendered profiles must skip private-data preloading when permission is absent. The tab hook clamps stale/private tab selections to Info, refuses unavailable selections, and cancels/removes this viewer/target's private cached profile data when restricted.
- Backend guards run before private searched-user cache hits and mutations. Basic profile reads for department heads bypass the profile response cache so the permission is recomputed. Keep existing administrator and accepted-supervisor behavior.
- Both repositories need deployment. No SQL migration or environment variable is required. Tests: student-profile-department-access.test.mjs (frontend) and student-profile-department-access.test.js (backend).

## Optional company rotations

- Optional per internship across every academic department; default off. Only owning students write, school staff and assigned employers read only.
- Backend features/internship-rotations/ locks the parent for writes, checks current department/supervisor access, validates actual dates/start-date lower bound and rejects inclusive overlaps. The internship end date is estimated: never cap rotation dates at date_ended, require an end estimate to create rotations, or add frontend max attributes from dateEnded. Pending/ongoing records can toggle; assignment mutations require ongoing status. Finished records are read-only.
- Rotations never change academic department, employer assignments, DTR totals/geofence, map grouping or evaluation uniqueness. Disabling retains history; deleting an assignment soft-deletes it.
- Narrative rotation_ids are validated against the locked internship; rotation_assignments stores saved display snapshots. Never recompute old printed assignments from the current timeline. Omitted selections preserve snapshots on edit; explicit [] clears them.
- NarrativeRotationPicker shows human-readable assignment dates and selects by coverage overlap even after the internship end estimate. Preserve saved labels and print content after timeline edits/removal/disable, and keep finished records readable without enabling writes. Backend docs/company-rotations-integrations.md maps the connected views, reads, caches and independent DTR/evaluation/map behavior. Do not propagate end-estimate bounds into these integrations.
- Shared UI: CompanyRotations; viewer/record queries: lib/hooks/useInternshipRotations.js. Keep pending feedback, retained drafts on failure, retry states and targeted invalidation. Rotation reads use authenticated no-store GET /api/internship-records/:internshipId/rotations with cancellation, deadlines and one transient retry. Keep cached assignments visible on refresh failure with a warning and disable editing until refreshed; hide cached data on 401/403/404. Narrative pickers still block saving on failed reads.
- Apply backend scripts/2026-10-27-internship-rotations.sql before deploying both repositories. No live migration or environment changes were made.

- Student-profile Company rotations is limited to the matching department head, verified using current database membership. Do not show the profile panel to admin, employer, student, or another department head. Students still manage My Records; authorized staff record-detail rotation views retain their existing access.

- Preserve matching skeletons for listing criteria transitions, Feedback discussions/intern selectors, evaluation eligibility, narrative rotation selectors, editable Leaflet chunk loading, and Rotations tab transitions. Calendar route and uncached month reads use CalendarSkeleton; retain valid cached calendar content during background refresh. Skeleton controls are decorative; existing validation and role/eligibility guards remain authoritative.

## Next.js security baseline

Next.js and eslint-config-next are aligned at 16.4.3 following the October 2026 security update. Keep the package lock with this change and rebuild/redeploy the frontend. This update requires no backend, SQL or environment changes.


## Password setup interface

The /set-password page uses EU-Connect school branding, the shared form styles, theme switching, accessible password-visibility controls, and a matching loading skeleton. Desktop shows the maroon brand panel; small screens keep the form first in a single column. Preserve the invitation token, password field names, action, validation and restricted-session behavior. This UI change requires no backend, SQL, package or environment changes.

## Manual and Help maintenance (October 30, 2026)

Keep `/help` and page manuals backed by `components/help-ui/guides/` and filtered through `getPageGuide`; do not duplicate feature instructions in new page components. `CompanyRotations` uses `HelpManual` with guide ID `rotations`, offered to students and authorized staff guides, excluding employer/registrar management guides. Shared `password-setup` explains invitations versus recovery and generic delivery confirmation. See `docs/manual-audit.md` for the source coverage audit. Distinguish grouped student list counts from employer placement statistics, student hours-gated completion from staff completion, upload limits from preview limits, and rotation end-date policy from calendar to-do eligibility. These guides do not change API permissions.

- HelpContact mounts AdminSupportContacts only for students/department heads. Read GET /help/admin-contacts with viewer-scoped query keys and no-store authenticated server action. Preserve skeleton/empty/retry states and mask cached contacts after 401/403. Employers get Create feedback instructions and /feedback navigation, not administrator contacts.

Department-category announcement cards and expanded content show the author department name and acronym to employer and admin viewers. The API adds nullable author_department_name/author_department_code to pinned, regular, direct-link and update responses using the author's current department assignment, consistent with existing feed scope. Missing details display a dash; General posts omit the label. No additional migration or environment changes; deploy both applications.

### Tagged announcement audience policy

Student tags now automatically restrict the announcement to tagged students, their current department heads, admins and the author. Only involved students/heads are notified; opted-in current supervisors also receive access and alerts. Broad General/Department audiences require removing all student tags. Ordinary heads remain limited to their department; Registrar/admin tagging can span departments. Existing tagged posts must be converted with backend scripts/2026-10-31-tagged-announcements-default-private.sql after the two earlier announcement-tag/audience migrations. No new columns or environment settings.


### Announcement mutation reliability

Announcement writes have a 20-second fetch deadline with explicit refresh-before-retry guidance; never automatically retry an uncertain write. Successful author mutations refresh viewer-scoped announcements, calendar and notifications. announcements_changed also invalidates those projections for other open sessions, including silent pin/unpin changes. Editing ordinary content does not recreate dismissed alerts; newly eligible audience members receive notifications. Pinning is restricted on the backend to current readable announcements. Keep help/manual guidance aligned; no new dependencies or environment settings.
