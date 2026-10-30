# DTR location assignment manual and handoff

Open **DTR Locations** from the sidebar, or `/dtr-locations` directly. The page manual and `/help` cards use `components/help-ui/guides/bulkDtrGuide.js` as the shared role-aware source.

## Who can use it

- Admin: all ongoing internships; Departments and dependent Courses filters.
- Department head: ongoing interns within their current department; Courses filter. Registrar heads are excluded from navigation, Help/manuals, the page and API.
- Employer: only their supervised ongoing internships; name search, without school-wide department/course filters.
- Students have no access to this management page. Their location remains available through their existing dashboard attendance tools and notifications.

## Individual and bulk workflow

1. Search by student name and use available filters. Table rows show avatars, names, course, department where applicable, company and current assignment. A student without a custom override uses the saved company location with a 150 m default, or shows no location if company coordinates are missing.
2. Tick one student for an individual assignment or several for bulk. The header checkbox selects **only the current page**, never every matching page. There are ten internship rows per page and a maximum of 100 per save. Selections persist across pages and filters; check the collective panel to review/remove individuals or Clear all. Hidden selections are still included in the reviewed action.
3. Search in the map (the existing one-second geocoder delay/loading remains) or click the desired point. The maroon pin previews the chosen location. Confirm/edit the address, keep it and any note within 255 characters, and choose a whole-number radius from 20–2,000 m. The default is 150 m. Coordinates alone are valid; notices use them if no address is supplied.
4. Select **Review assignment**. The confirmation records the selected IDs, location and radius so background map lookups cannot alter what is saved. Saving replaces existing assignments and creates overrides for company-default students. It does not change company addresses, old attendance, hours or internship dates.
5. Read the result counts. Successful and unchanged selections are cleared; failures remain selected with student names and reasons. Refresh updates both table and map. Unchanged assignments send no duplicate notices. When a request cannot be confirmed, refresh before retrying: it may have committed already. Unexpected database errors roll back the write set; inaccessible/stale internships are reported individually while eligible records can succeed.

Blue map pins group **saved custom assignments at the same coordinates** across authorized students in the current search/filters, across all table pages. Open a pin to see count, avatars, names, notes and per-student radius. Different locations have different pins; a single student also has a pin. Reassignment moves membership after refresh. Pins never reveal students outside the viewer's permissions. Company fallback locations are labeled in the table and are not shown as saved custom pins.

Every changed student receives a notification identifying the assigned/updated location and instructing them to remain inside the radius for clock-in and clock-out. Existing attendance/start-date rules continue. Admin/head actions also notify assigned supervising employers, grouped once per employer per action with student names, location and the setter's name. Students without supervisors still get their own notice. Employer actions notify changed students but do not create employer self-notifications.

## Implementation and setup

The backend owns fresh authorization, latest academic membership, supervisor relationships, validation, row locking, upserts and transactional notification persistence. Frontend role guards and viewer-scoped query keys support the UI, not API authorization. Selection uses internship IDs held only in this page's memory, reset when viewer identity changes. The existing profile editor and bulk endpoint share backend validation; both write `dtr_locations`. The existing map form accepts optional Leaflet children for saved pins, leaving other map forms intact. No new routing/geocoding service or key is introduced.

API reads: `/api/v1/dtr-locations/students` and `/pins`; write: `/assign`. Browser server actions retain HttpOnly token handling, private/no-store reads and bounded waits; no automatic write retries. Loading skeletons cover route/table/map import; errors have retry, and access-denied results hide cached records/pins. Saved notices and manual refresh remain useful when sockets disconnect.

No new SQL structures or data migration are required in the inspected schema. Run backend `scripts/2026-10-30-bulk-dtr-locations.sql` first to verify the existing InnoDB tables, coordinate types, one-per-internship unique index, foreign keys and `dtr_location_set` notification fields. Deploy backend and frontend together. No `.env`, package or configuration changes are required. Backend details: `../ims-backend/features/dtr-locations/README.md` in the paired checkout.
