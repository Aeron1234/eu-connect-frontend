import { companyAnalyticsGuide, registrarDashboardGuide } from './analyticsGuides';
import { feedbackStaff, recordsGuide, rotationsGuide, mapGuide, calendarStaff, deptAnnouncements, generalAnnouncements, dtrLocationGuide, pastGuide } from "./commonGuides";

import { bulkDtrGuide } from './bulkDtrGuide';
const departmentHeadGuides = [
companyAnalyticsGuide, registrarDashboardGuide,
bulkDtrGuide('department_head'),
{
  id: "evaluation-criteria",
  hideForRegistrar: true,
  title: "Manage your department's evaluation criteria",
  summary: "Set the questions students and their supervisors answer for your department.",
  steps: [
    "Switch between Student performance and Supervisor evaluation forms. Each form shows only your department's questions.",
    "Use the active and inactive filters. Add a section, then add its first criterion to save it.",
    "Add more questions or deactivate and reactivate a question or whole section. Confirm changes before saving.",
    "Inactive questions are removed from new forms; existing evaluation scores remain available in past reports. Students and supervisors can submit only when the department has active questions for that form."
  ],
  href: "/department_head/evaluation-criteria",
  linkText: "Open Evaluation Criteria"
},
{
  "id": "dashboard",
  "hideForRegistrar": true,
  "title": "Track your department overview",
  "summary": "Review student hours, placement activity, and evaluation summaries.",
  "steps": [
    "Review the dashboard cards, charts, and recent activity for your department.",
    "In Student Hours Tracker, use the course filter, student search and page controls, then open a student profile for more detail. The hours distribution chart summarizes all active department interns, rather than just the current tracker page.",
    "Use Records for placement approvals and saved work. Registrar accounts use the tools available to their office, including SIPP Reports."
  ],
  "href": "/department_head",
  "linkText": "Open dashboard"
},
feedbackStaff,
{ ...recordsGuide, ...{"hideForRegistrar":true} },
{ ...rotationsGuide, hideForRegistrar: true },
mapGuide,
{
  "id": "sipp",
  "title": "Prepare SIPP Annex C and Annex D",
  "summary": "Review registrar reports and preview official PDFs.",
  "steps": [
    "In Annex C, use Form to enter the academic year, degree program, issues and concerns, solutions, recommendations, and signatories. Add or remove rows to match the actual content, then choose Save Draft or Submit Annex C.",
    "In Reports, use the filters to find saved Annex C reports. Drafts offer Edit draft and can be submitted when ready. Submitted reports do not offer the draft editor. Use the available delete control when needed and confirm deletion.",
    "In Annex D, choose an academic year, find a host training establishment, and review its interns, programs, gender, and internship dates.",
    "Select Export PDF for the selected report or establishment. Preview at 75%, review every page, then Print or Download.",
    "Annex tables grow with the actual records and do not add fixed blank rows. Annex D dates use Month day, year for both ends, or Present for an ongoing placement."
  ],
  "href": "/department_head/sipp-reports",
  "linkText": "Open SIPP Reports",
  "onlyRegistrar": true
},
calendarStaff,
deptAnnouncements,
{ ...generalAnnouncements, ...{"onlyRegistrar":true} },
{ ...dtrLocationGuide, ...{"hideForRegistrar":true} },
pastGuide
];

export default departmentHeadGuides;
