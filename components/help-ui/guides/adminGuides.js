import { companyAnalyticsGuide } from './analyticsGuides';
import { feedbackStaff, recordsGuide, rotationsGuide, mapGuide, calendarStaff, generalAnnouncements, dtrLocationGuide, pastGuide } from "./commonGuides";

import { bulkDtrGuide } from './bulkDtrGuide';
const adminGuides = [
companyAnalyticsGuide,
bulkDtrGuide('admin'),
{
  "id": "dashboard",
  "title": "Review the system dashboard",
  "summary": "Monitor accounts, placements, and recent activity.",
  "steps": [
    "Review the overview cards and charts for account growth, user roles, and internship distribution.",
    "Read recent activity, then open the relevant management page for records, accounts, or detailed audit entries."
  ],
  "href": "/admin",
  "linkText": "Open dashboard"
},
feedbackStaff,
{
  "id": "accounts",
  "title": "Create and manage accounts",
  "summary": "Choose an account type, send a password setup invitation, and manage access.",
  "steps": [
    "Open Form and select the account type under Who is this account for? The form shows the fields needed for that role. Enter first and last name, a working email address, and a unique username. Middle initial is optional and accepts one letter, optionally followed by a period.",
    "For a student, select a course and gender; the department comes from the selected course. For a department head, select the department they will manage. Employers do not need academic assignments. Check the account preview before submitting.",
    "Select Create Account. You do not choose or receive the user's password. EmailJS sends a one-use setup link to the email you entered, valid for 24 hours. The user opens Set your password, saves and confirms their own password, then signs in with the username and new password. Until setup is complete, the account cannot sign in.",
    "If email delivery is unconfirmed, the account has still been created. Keep it and use Resend invitation instead of creating it again. Ask the recipient to check Spam or Junk if the message is missing.",
    "In Accounts, check Pending password setup and use Resend invitation for an active pending account when needed. Wait one minute between resend attempts. A new invitation replaces earlier links; completed accounts no longer offer this action. Existing users recover access through Forgot password using their registered email.",
    "Use Accounts to search names or email addresses and filter by role.",
    "Use the account's available activate or deactivate control and confirm the change when prompted. Deactivation prevents sign-in."
  ],
  "href": "/admin/create-account",
  "linkText": "Open Accounts"
},
{
  "id": "departments",
  "title": "Manage departments and courses",
  "summary": "Maintain academic choices and their availability.",
  "steps": [
    "Use the department and course forms to add entries. Choose the course's department before saving.",
    "Switch between Departments and Courses. Search by name or code and filter active or inactive entries.",
    "Use Edit to correct details or the course's department. Activate or deactivate entries with the available controls; confirm department deactivation."
  ],
  "href": "/admin/departments-and-courses",
  "linkText": "Open Departments & Courses"
},
{
  "id": "activity-logs",
  "title": "Review and manage activity logs",
  "summary": "Trace recorded actions and review deletions before confirming.",
  "steps": [
    "Review the summary cards, search descriptions, and filter by Role or Module.",
    "Read an entry's action, actor, time, and related details. Select View submitted details for a new internship post, View update details for readable field labels, or View full description for a long message.",
    "Use a log's trash control and confirm to remove an individual entry.",
    "To delete a range, choose its From and Through dates and review the matching count before confirming. The date-range deletion is separate from the current search and role/module filters; check the preview carefully."
  ],
  "href": "/admin/activity-logs",
  "linkText": "Open Activity Logs"
},
{
  "id": "cache-monitoring",
  "title": "Inspect cache monitoring",
  "summary": "Understand server response reuse and refresh its metrics.",
  "steps": [
    "This page measures the backend response cache for one running server process, not browser data or database query time.",
    "A hit reuses a saved response; a miss needs a fresh response. Hit rate is hits divided by hits plus misses.",
    "Use Refresh or Auto-refresh for snapshots every 30 seconds. The first snapshot is since server startup; later activity compares snapshots. A server restart resets the counts.",
    "Search or sort Routes using the cache to examine misses, bypasses, stores, and invalidations. A bypass skips lookup; a skipped store means the response was not saved.",
    "Stored entries indicate capacity. Memory figures are estimates and process heap covers the entire server."
  ],
  "href": "/admin/cache-monitoring",
  "linkText": "Open Cache Monitoring"
},
{
  "id": "evaluation-criteria",
  "title": "Manage evaluation criteria",
  "summary": "Maintain the sections and questions available for new evaluations.",
  "steps": [
    "Switch between Student and Employer evaluation forms and use the active or inactive filters.",
    "Enter a section title and Add Section. The section is saved after its first criterion is added.",
    "Use Add criterion for further questions in that section. Use the available controls to deactivate or reactivate a criterion or section.",
    "Confirm deactivation. Inactive questions are unavailable to new evaluations."
  ],
  "href": "/admin/evaluation-criteria",
  "linkText": "Open Evaluation Criteria"
},
recordsGuide,
rotationsGuide,
mapGuide,
{
  "id": "error-tracking",
  "title": "Investigate server errors",
  "summary": "Trace grouped unexpected failures and their occurrences.",
  "steps": [
    "Similar server or reported background-job failures are grouped. Groups count distinct problems; occurrences count how often they happened.",
    "Search a route, error code, or message and filter by date, method, source, or status. Use the page controls for older groups.",
    "Expand a group for up to 25 recent occurrences. Review the time, route and method, message, available code location, and request ID. Background jobs show their source.",
    "Deleting a group permanently removes all its recorded occurrences, including those outside current filters. Future occurrences can be recorded again.",
    "Refresh for newer entries. Errors are normally kept for 30 days. Some fatal process failures can appear only in hosting logs."
  ],
  "href": "/admin/error-tracking",
  "linkText": "Open Error Tracking"
},
calendarStaff,
generalAnnouncements,
dtrLocationGuide,
pastGuide
];

export default adminGuides;
