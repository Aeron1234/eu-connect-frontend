import { feedbackStaff, recordsGuide, mapGuide, calendarStaff, deptAnnouncements, generalAnnouncements, dtrLocationGuide, pastGuide } from "./commonGuides";

const departmentHeadGuides = [
{
  "id": "dashboard",
  "hideForRegistrar": true,
  "title": "Track your department overview",
  "summary": "Review student hours, placement activity, and evaluation summaries.",
  "steps": [
    "Review the dashboard cards, charts, and recent activity for your department.",
    "In Student Hours Tracker, use the course filter and student search, then open a student profile for more detail.",
    "Use Records for placement approvals and saved work. Registrar accounts use the tools available to their office, including SIPP Reports."
  ],
  "href": "/department_head",
  "linkText": "Open dashboard"
},
feedbackStaff,
{ ...recordsGuide, ...{"hideForRegistrar":true} },
mapGuide,
{
  "id": "sipp",
  "title": "Prepare SIPP Annex C and Annex D",
  "summary": "Review registrar reports and preview official PDFs.",
  "steps": [
    "In Annex C, use Form to enter the academic year, degree program, issues and concerns, solutions, recommendations, and signatories. Add or remove rows to match the actual content, then choose Save Draft or Submit Annex C.",
    "In Reports, use the filters to find saved Annex C reports. Use the available edit or delete controls to manage a report; confirm deletion.",
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
