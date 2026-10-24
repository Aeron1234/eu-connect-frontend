# Frontend agent guide

This guide applies to this frontend repository and its descendants. It records the frontend behavior established during the current project work, as of October 24, 2026. Use it as a handoff and a list of behavior to preserve. Check the current implementation before changing a contract; historical test counts and screenshots do not prove current deployment behavior.

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
- City/municipality groups show unique student counts across departments within the active search and region filters. Expand groups to show companies and student names.
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

- Employers are excluded from announcements, including navigation, quick actions, help content, and direct route access.
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
- Permit one active evaluation per internship record in each evaluation direction.
- `EvaluationPostingGuard` must fail closed while eligibility is loading or failed. Frontend guards do not replace atomic backend uniqueness enforcement.
- Author deletion is a soft delete using deleted_at. Hide that evaluation's summary from its author and allow a replacement, with only one active evaluation at a time.
- Authorized staff retain deleted history with a Deleted label.
- Staff permanent deletion is available only for evaluations already soft-deleted, within the existing access rules.
- Employer evaluation notifications target /internship-records/[internshipId], not a student profile ID. Refresh the relevant evaluation data on notification actions.
- Database lifecycle/uniqueness migrations belong to the backend. Do not reintroduce status requirements after their removal.

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
- Authorized stored PDFs use the shared preview rather than automatic download. Non-PDF files retain their existing behavior.
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
- Downloads preserve the original PDF. Non-PDF documents continue using their established behavior.
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

- `lib/notification-routes.js` centralizes notification targets. Preserve encoded IDs, relevant record/profile tabs, schedule destinations, and announcement feed targeting.
- `lib/favorite-toggle-sync.mjs` reconciles rapid favorite toggles without letting an older response overwrite newer intent.
- Account creation keeps the responsive form/preview, role-sensitive department/course assignments, and optional email/middle-initial handling; do not display undefined name fragments.
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
- Preserve role and registrar filtering: students have no Feedback guide, employers have no full Calendar or Announcements links, and registrar accounts use SIPP Reports instead of the department dashboard/Records guides.
- Manuals remain useful in empty or locked states. They explain eligibility without exposing unavailable actions. Use ManualDialog for scrollable mobile dialogs and its existing accessible info trigger.
- Feedback manuals distinguish employer authors from staff: category audiences, tagged-student notifications, internal notes, status/reopening, author-only post/reply changes, attachment previews, and actual file deletion must match the implementation.
