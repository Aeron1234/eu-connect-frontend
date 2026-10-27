# EU-Connect — Frontend

**An internship management workspace for the OJT program of Manuel S. Enverga University Foundation–Candelaria, Inc. (MSEUF-CI).**

EU-Connect connects students, company supervisors, department heads, registrar staff, and administrators throughout the internship process: placement approval, attendance, requirements, weekly narratives, reports, evaluations, and school reporting.

This repository contains the **Next.js frontend**, including its server-rendered pages, Server Actions, authenticated API handlers, and PDF generation services. It works with a separately deployed backend for business rules, database records, file storage, and Socket.IO events.

## Contents

- [Features](#features)
- [Roles and access](#roles-and-access)
- [Technology](#technology)
- [Architecture](#architecture)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Route guide](#route-guide)
- [Project structure](#project-structure)
- [Documents and printing](#documents-and-printing)
- [Maps and location](#maps-and-location)
- [Development conventions](#development-conventions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Further documentation](#further-documentation)

## Features

### Student internship workspace

- A dashboard with internship progress, completed hours, attendance, favorite opportunities, unread announcements, stored documents, and missing requirements.
- Internship record submission with company details, dates, required hours, and a map-selected workplace. Pending records can be edited before approval.
- Daily Time Records (DTR), including clock-in, breaks, resume duty, and clock-out with location checks against the approved attendance area.
- Weekly narratives with saved coverage dates, readable cards, editing, and printable journals.
- Summary reports with structured reflections, optional memorabilia images, and PDF export.
- Before- and after-deployment document organization, supervisor-uploaded document review, and access to personal files from earlier internships.
- Internship opportunity search, filters, and favorites.
- Supervisor search and supervision requests.
- Supervisor evaluations and a history of the student's own submissions.

### Employer supervision

- An overview dashboard for posted opportunities, supervised interns, documents, and recent activity.
- The **Interns You Supervised** card with All, Ongoing, and Completed filters and student profile links.
- Accept or decline supervision requests in **Notifications**. Unanswered active request notifications cannot be deleted.
- Internship posting management with eligible-course and work-type choices.
- Authorized access to supervised students' attendance, narratives, certificates, and evaluation tools.
- Confidential student performance evaluations with preview, printing, and downloading.
- Feedback & Concerns posts with optional intern tags, attachments, and discussion replies.

### School administration and monitoring

- Department dashboards with student-hour tracking and placement/evaluation charts.
- Internship approval, rejection, restoration, completion, and record-detail review.
- A student placement map with city groupings, visit recommendations, company details, road routes, and Google Maps directions.
- An alumni placement directory with search, academic-year filtering, and department filtering.
- Announcements, event date ranges, calendar schedules, and student to-dos according to role.
- Registrar SIPP Annex C and Annex D reporting with dynamic tables and printable school templates.
- Administrator tools for accounts, departments, courses, evaluation criteria, activity logs, cache monitoring, and error tracking.

### Shared experience

- Responsive layouts, mobile navigation, light/dark themes, and page-specific loading skeletons.
- Notification inbox and header dropdown with links to related records and discussions.
- Shared form validation and loading/success/error action toasts.
- Retry states that distinguish failed reads from empty results.
- Document preview before printing or downloading.
- Role-specific Help content and manuals accessible from individual pages.

## Roles and access

The application uses four role codes. Registrar access is a department-head account with department code `REG`.

| Role | Main responsibilities |
| --- | --- |
| Student (`student`) | Manage personal internship records, attendance, requirements, narratives, reports, and supervisor evaluations. |
| Employer (`employer`) | Manage opportunities, respond to supervision requests, supervise accepted interns, submit performance evaluations, and post feedback. |
| Department head (`department_head`) | Review permitted internship records, monitor student progress, plan visits, post department announcements, and participate in relevant discussions. |
| Registrar (`department_head` + `REG`) | Prepare SIPP reports and post General announcements through the office's permitted tools. |
| Administrator (`admin`) | Manage accounts and academic settings, review school records, and inspect system activity and diagnostics. |

Important access rules:

- Department heads see only Info when searching a student from another department. Private internship tabs and their backend endpoints require matching current department membership.

- Employers have no access to Announcements or the full Calendar page. Their header calendar remains available as a month-view popup.
- Regular department heads post **Department** announcements and can read General announcements. Registrar accounts and administrators post **General** announcements.
- Employer performance evaluations are confidential to the submitting employer and authorized school staff. Students cannot view them.
- Each evaluation direction permits one active evaluation per internship. An author's deletion hides their copy and allows a replacement; authorized staff retain the deleted history and can permanently delete those copies.
- Narrative creation/editing, summary report creation/editing, and employer performance-evaluation submission require the applicable internship start date to have arrived in Philippine time.
- Students cannot access Feedback & Concerns. General Feedback reaches the author, administrators, and all department heads. Technical Issues and Platform Feedback reach the author and administrators. Internship concerns also reach the department heads of tagged students.
- Profile tabs and record details remain subject to the viewer's supervision relationship, department, role, and backend authorization.

## Technology

| Area | Libraries / approach |
| --- | --- |
| Framework | Next.js 16 App Router and React 19 |
| Language | JavaScript and ES modules |
| Styling | Tailwind CSS 4, shadcn-style shared components, Radix UI, Base UI |
| Theme and icons | next-themes and Lucide React |
| Data fetching | Server Actions, authenticated route handlers, TanStack Query 5 |
| Charts | Recharts |
| Maps | React-Leaflet, Leaflet, leaflet-geosearch, OpenStreetMap data |
| Live events | Socket.IO client |
| Authentication | Custom JWT access/refresh cookies and backend-issued socket tickets |
| PDF generation | Puppeteer; Puppeteer Core with Sparticuz Chromium on Vercel |
| PDF viewing | React-PDF / PDF.js |
| Other document previews | docx-preview, SheetJS CE, browser text/image rendering |
| Non-PDF printing | react-to-print |
| Forms and feedback | Shared ModalForm validation, Sonner action toasts, react-dropzone |
| Tests | Node.js test runner, JSDOM, React rendering, and mocked integrations |

The exact dependency versions are recorded in `package.json` and `package-lock.json`.

## Architecture

```text
Browser
  ├─ React interface + TanStack Query
  ├─ Document previews, maps, and browser geolocation
  └─ Socket.IO client ────────────────────────────┐
                                                │
Next.js server                                  │
  ├─ proxy.js: session checks and token refresh  │
  ├─ Server Actions: authenticated backend calls │
  ├─ Route handlers: search, files, map routing  │
  └─ Report services: HTML → Chromium → PDF      │
                 │                              │
                 ▼                              ▼
          Separate backend API + Socket.IO server
                 │
                 ▼
          Database and private file storage
```

The Next.js server reads the access token from an HTTP-only cookie and forwards authorized requests to the backend. The browser obtains a short-lived socket ticket through `/api/socket-ticket` for Socket.IO authentication.

`proxy.js` handles page-level authentication. Protected layouts and backend endpoints apply the relevant role and record checks. API handlers perform their own authentication because `/api/*` is outside the proxy matcher.

This frontend does not need direct database credentials. Database access and migrations belong to the backend.

## Local setup

### Prerequisites

- **Node.js `>=24.22.1 <25`**, matching this repository's engine requirement.
- npm and access to the package registry and the pinned SheetJS distribution.
- A running compatible backend, with its database, file storage, and authentication configured.
- An account provisioned through the backend/administrator workflow.

### 1. Open the repository

Clone this frontend repository and open its root directory.

### 2. Configure the environment

Create `.env.local` in the repository root:

```dotenv
API_BASE_URL=http://localhost:7000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:7000
ACCESS_TOKEN_SECRET=replace_with_the_same_access_token_secret_used_by_the_backend
```

These are example URLs and a placeholder secret. Use the addresses and access-token signing secret configured for your backend.

### 3. Install dependencies

```bash
npm ci
```

Keep the committed `.npmrc` configuration. SheetJS CE is pinned to its official distribution tarball, and `allow-remote=root` supports that root dependency in npm versions that require it.

The installation script also prepares local PDF.js viewer resources. Puppeteer may download its managed browser during installation.

### 4. Start development

Start the backend, then run:

```bash
npm run dev
```

Open **http://localhost:3000**. The root route sends signed-in users to their role dashboard and other visitors to the login landing page.

Restart the development server after changing server environment variables.

## Environment variables

| Variable | Where used | Purpose |
| --- | --- | --- |
| `API_BASE_URL` | Next.js server | Backend API base, normally ending in `/api/v1`. |
| `NEXT_PUBLIC_SOCKET_URL` | Browser | Socket.IO server origin, such as `https://backend.example.com`. Use the server origin rather than its `/api/v1` path. |
| `ACCESS_TOKEN_SECRET` | Next.js server | Verifies backend-issued access tokens. Must match the backend signing secret. |

`NODE_ENV` is managed by the development/production commands. Vercel supplies `VERCEL`, which selects the serverless Chromium implementation.

Do not place secrets in `NEXT_PUBLIC_*` variables or commit `.env.local`. The public socket URL is embedded in the client build; rebuild and redeploy after changing it.

### Backend API compatibility

[lib/api-base-url.mjs](lib/api-base-url.mjs) normalizes backend addresses to the canonical `/api/v1` base. Previous values ending in `/eu-connect`, `/eu-connect/api`, or `/api` are supported during migration.

Server callers append resource paths such as `/auth/login`; they should not add another `/api` prefix.

[next.config.mjs](next.config.mjs) forwards both `/api/v1/:path*` and the legacy `/eu-connect/api/:path*` to the configured backend. Next.js-owned handlers such as `/api/reports/*`, `/api/users`, `/api/map/route/*`, and `/api/socket-ticket` remain separate.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create the production build. |
| `npm start` | Serve an existing production build. |
| `npm run prod` | Build and start the production application. |
| `npm test` | Run the frontend's automated test suite. |
| `npm run lint` | Run ESLint. |
| `npm run prepare:pdf-preview` | Copy the installed PDF.js worker and viewer resources into `public/pdfjs/`. |

The PDF resource script runs automatically after installation and before development/build commands. If installation scripts were disabled, run it manually.

To lint while excluding generated PDF.js resources:

```bash
npm run lint -- --ignore-pattern "public/pdfjs/**"
```

For the Webpack production-build path used in project verification:

```bash
npm run build -- --webpack
```

## Route guide

Page access and available actions depend on the session and backend permissions.

| Route | Purpose / audience |
| --- | --- |
| `/` | Redirect to the role dashboard or login. |
| `/login` | Public landing page and sign-in dialog. |
| `/forgot-password`, `/set-password` | Password recovery/setup workflow. |
| `/student` | Student overview and attendance. |
| `/student/internship-record` | Personal placement form and record history. |
| `/student/narratives` | Weekly narratives and journal export. |
| `/student/summary-reports` | Summary reports and PDF export. |
| `/student/storage` | Personal requirements and document history. |
| `/student/evaluations` | Student-authored supervisor evaluations. |
| `/employer` | Employer dashboard and supervised interns. |
| `/department_head` | Department overview. |
| `/department_head/sipp-reports` | Registrar-only SIPP Annex C/D tools. |
| `/admin` | Administrator overview. |
| `/admin/create-account` | Account creation and account management. |
| `/admin/departments-and-courses` | Academic reference data. |
| `/admin/evaluation-criteria` | Evaluation sections and criteria. |
| `/admin/activity-logs` | Activity history and management. |
| `/admin/cache-monitoring` | Backend response-cache diagnostics. |
| `/admin/error-tracking` | Recorded backend error groups and occurrences. |
| `/student/account`, `/employer/account`, `/department_head/account`, `/admin/account` | Role-specific account and password settings. |
| `/internships` | Opportunity browsing, favorites, and employer posting controls. |
| `/users`, `/users/[userId]` | User search, profiles, and permitted internship tabs. |
| `/internship-records`, `/internship-records/[internshipId]` | Administrator/department-head record review. |
| `/map` | Administrator/department-head visit planning. |
| `/past-internships` | Alumni placements for students and school staff. |
| `/announcements` | Announcements for students and school staff. |
| `/calendar` | Student and school-staff calendar tools. |
| `/feedback` | Employer and authorized school-staff discussions. |
| `/notifications` | Notification inbox and supervisor-request responses. |
| `/help` | Role-aware instructions and page manuals. |

### Next.js API handlers

| Path | Purpose |
| --- | --- |
| `GET /api/users` | Authenticated backend user search. |
| `POST /api/socket-ticket` | Obtain a short-lived socket authentication ticket. |
| `GET /api/map/route/[internshipId]` | Authorized route lookup and provider fallback. |
| `GET /api/feedback/[postId]/attachments/[attachmentId]` | Authorized feedback attachment access. |
| `GET /api/reports/weekly-narratives` | Generate a narrative journal PDF. |
| `GET /api/reports/summary-report` | Generate a summary report PDF. |
| `GET /api/reports/student-evaluation` | Generate a confidential performance-evaluation PDF. |
| `GET /api/reports/annex-c` | Generate an Annex C PDF. |
| `GET /api/reports/annex-d` | Generate an Annex D PDF. |

Despite its name, `student-evaluation` represents the employer's performance evaluation of a student. The existing `app/api/auth/[...nextauth]/route.js` contains commented legacy code; active authentication is implemented in the custom auth actions.

## Project structure

```text
app/
  (role directories and shared pages)
  api/                   Authenticated Next.js handlers
  _services/             PDF runtime, report generators, templates and assets
  _styles/               Global theme and landing-page styles
components/
  (feature)-ui/          Feature-specific forms, lists, hooks and panels
  dashboard-ui/          Dashboards, statistics and charts
  help-ui/guides/        Shared role/page instructions
  skeletons/             Loading placeholders
  ui/                    Reusable navigation, dialogs, previews and controls
contexts/                Session-user and sidebar state
lib/
  cache/                 TanStack Query keys, options and invalidation helpers
  server-actions/        Authenticated backend reads and mutations
  hooks/                 Shared client hooks
  *.js / *.mjs           Validation, permissions, dates and domain helpers
public/                  Static assets and generated PDF.js resources
scripts/                 PDF.js asset preparation
tests/                   Automated frontend checks
proxy.js                 Page-level authentication entry point
next.config.mjs          Rewrites, server actions and Chromium tracing
AGENTS.md                Repository maintenance and behavior guide
```

## Documents and printing

The shared [PdfPreviewProvider](components/ui/PdfPreviewProvider.js) opens previews before an explicit print or download action. The default preview zoom is **75%**.

| File type | Preview / print behavior |
| --- | --- |
| PDF | React-PDF viewer, page navigation, zoom, full-document printing, and original PDF download. |
| DOCX | docx-preview rendering and document printing. |
| XLS / XLSX / CSV | SheetJS CE worksheet preview; print the selected sheet's saved values. |
| Text and supported images | Browser-rendered preview and printing. |
| Legacy DOC or unsupported/unreadable files | Explicit original-file download remains available. |

Office files are processed with a cancellable worker and sandboxed preview content. Preview limits are displayed: 25 MB input, up to 1,000 spreadsheet rows and 100 columns, and up to 150 Word pages. Printing an incomplete preview is disabled.

Browser Office previews can differ from Microsoft Office in layout, charts, or pagination. Download preserves the original file.

Generated school PDFs use HTML templates and Chromium, with embedded logo/font assets and Times New Roman formatting. Supported outputs include weekly journals, summary reports, performance evaluations, and SIPP Annex C/D. Annex tables follow the actual number of records.

See the [preview implementation notes](components/ui/PDF_PREVIEW.md) and [print-template reference](app/_services/templates/PRINT_TEMPLATES.md).

## Maps and location

The map uses React-Leaflet with OpenStreetMap data. Search and region filters also apply to company lists, city groups, and visit recommendations.

- City groups show student names and unique student counts across departments.
- Recommendations prioritize cities with more students; ties use straight-line proximity to the nearest company.
- Routes start at MSEUF-CI in Candelaria (`13.9304557, 121.4312752`) or the viewer's opt-in current location.
- Successful road routes display geometry, distance, and estimated driving time. Traffic and stops are excluded.
- Google Maps directions remain available for fallback and navigation while travelling.
- Company details slide out inside the map on desktop and mobile.
- In `/internship-records/[internshipId]` → Overview, the company pin popup includes **See on Google Maps**. It uses the saved company coordinates and the same campus-to-company directions helper as `/map`, opening in a new tab without requesting a road route.

Viewer location is refreshed approximately 10 seconds after each completed location read. Active routes refresh after movement/time thresholds; location access requires permission and HTTPS or localhost. Position updates are scoped to the viewer's map session and stop when the page is left. Coordinates used to calculate routes are sent to the configured routing provider.

Public route-service connectivity is best effort. The browser request and same-origin fallback have bounded loading/error states. See [authenticated map routing](app/api/map/README.md) for the provider flow, deadlines, cache behavior, and troubleshooting details.

## Development conventions

- Put backend calls in `lib/server-actions/` or an authenticated route handler. Use `getApiBaseUrl()` and the existing token/error helpers.
- Keep query keys scoped to the viewer, record, filters, and page. Invalidate affected queries after confirmed mutations and relevant socket events.
- Preserve cached content during background-refresh failures and show the shared retry UI. Treat a failed read differently from an empty result.
- Reuse shared Select, dialog, ModalForm, confirmation, preview, and toast components.
- Keep small-screen layouts and loading skeletons in sync with page changes.
- Apply internship start-date checks using Philippine calendar days. Keep backend checks authoritative.
- Update shared Help guides when a user workflow changes.
- Keep confidential data and document permissions consistent across list, detail, print, notification, and cached views.

[AGENTS.md](AGENTS.md) records more detailed implementation constraints and established behavior.

## Testing

Run the frontend checks with:

```bash
npm test
```

The suite covers API/error handling, form validation, role permissions, evaluation confidentiality, internship dates, document access/previews/printing, map routing and location, pagination, notification behavior, feedback, and dashboard states.

Many tests use mocked requests, in-memory fixtures, or JSDOM. They do not verify a deployed backend, real GPS accuracy, a physical printer, or every browser layout. Verify those integrations in the target environment.

## Deployment

### Shared requirements

1. Deploy a compatible backend and apply its required database migrations through the backend's deployment process.
2. Configure the three frontend environment variables for the target environment.
3. Install dependencies with `npm ci` and keep installation/build hooks enabled.
4. Build and run the frontend using a Node.js version matching `engines.node`.
5. Verify login, token refresh, Socket.IO, uploads, location permissions, map routing, PDF generation, and preview/printing after deployment.

The application requires server execution for authentication, Server Actions, API handlers, and PDFs. Deploy it as a Next.js server application.

### Vercel

The PDF runtime selects Puppeteer Core and Sparticuz Chromium when `VERCEL` is present. The configuration traces Chromium files for report handlers, and those handlers declare the Node.js runtime.

Set `API_BASE_URL` to the backend's HTTPS API base and `NEXT_PUBLIC_SOCKET_URL` to its public HTTPS Socket.IO origin. Configure the backend to accept the frontend's origin. The Socket.IO connection goes directly to that backend.

### VPS / self-hosted Node.js

Build with `npm run build`, then run `npm start` under the hosting environment's process manager.

The non-Vercel PDF path uses Puppeteer's managed browser. Ensure its browser files, operating-system dependencies, and launch permissions are available to the production user.

When using a reverse proxy such as Nginx, route frontend traffic to Next.js and configure the backend/Socket.IO upstream with WebSocket support. Preserve HTTPS so secure session cookies and browser location features work.

Changing the hosting arrangement does not move the database or storage automatically; configure those services through the backend separately.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Startup reports a missing access-token secret | Set `ACCESS_TOKEN_SECRET` in the server environment and restart. |
| Login repeatedly returns to the login page | Check backend reachability, matching token secrets, cookie behavior, and HTTPS in production. |
| API calls fail or reach the wrong path | Check `API_BASE_URL` and its canonical `/api/v1` destination. |
| Notifications do not update | Check `NEXT_PUBLIC_SOCKET_URL`, `/api/socket-ticket`, backend origin settings, and WebSocket forwarding. |
| PDF viewer worker/fonts fail to load | Run `npm run prepare:pdf-preview` and make sure the generated `public/pdfjs/` assets are deployed. |
| PDF generation fails | Check the server's Chromium installation/runtime, permissions, memory, and report-handler logs. |
| Location access fails | Check browser permission, HTTPS/localhost, and device location availability. |
| A road route fails | Review the route error stage, retry, or use the Google Maps directions link. |
| Office preview fails or looks different | Use Download original file and inspect the document in its original application. |
| An upload times out | Refresh the file list before retrying to check whether the original upload was saved. |

## Further documentation

- [Frontend behavior and maintenance guide](AGENTS.md)
- [PDF and other document previews](components/ui/PDF_PREVIEW.md)
- [Printable school templates](app/_services/templates/PRINT_TEMPLATES.md)
- [Authenticated map routing](app/api/map/README.md)
- [Role and page help content](components/help-ui/guides/)

## Optional company rotations

Available per internship across all academic departments; default off. Students opt in on the internship form or later in My Records. Dated assignments are managed on an ongoing internship; finished timelines are read-only. School record Overview/Rotations and accepted-employer profile Info provide authorized read-only views. Disabling retains history.

Narrative forms suggest every rotation overlapping the coverage dates. The backend validates selections and stores snapshots for cards, preview and printing, preserving old assignment labels after timeline changes. Attendance, map grouping, overall supervision and evaluation uniqueness remain on the original internship.

Apply backend `scripts/2026-10-27-internship-rotations.sql` before deploying both apps. Existing internships default to off; legacy narrative snapshots stay null. No new environment variables. Tests: `internship-rotations.test.mjs` (frontend) and `internship-rotations.test.js` (backend).

### Internship rejection reasons

Apply backend `scripts/2026-10-27-internship-rejection-reason.sql` before deploying both applications. Staff must enter a reason (up to 1,000 characters) when rejecting a pending internship record, from either the list or detail confirmation. The saved reason is the student notification message and appears on their rejected record card. Failed submissions retain the reason; restoring clears it on the record, while previous notifications remain historical. Existing rejected records have no reason until a future rejection. No environment changes are required.

### Map department filter

The map supports department acronym filtering alongside search and region. Filtering applies to individual interns at mixed-department company sites, and the same results drive pins, company details, city counts and recommendations. The backend includes department metadata from the latest academic row and availableDepartments in the map response. Deploy both applications; no SQL or environment changes are needed.

The student My Records Form tab places Company rotations above the record form for easier access. Record-detail tabs use a building icon for Overview and a repeat-arrows icon for Rotations.
