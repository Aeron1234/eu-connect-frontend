import { companyAnalyticsGuide, registrarDashboardGuide } from './analyticsGuides';
import { feedbackStaff, recordsGuide, rotationsGuide, mapGuide, calendarStaff, deptAnnouncements, generalAnnouncements, dtrLocationGuide, pastGuide } from "./commonGuides";

import { bulkDtrGuide } from './bulkDtrGuide';
const departmentHeadGuides = [
companyAnalyticsGuide, registrarDashboardGuide,
bulkDtrGuide('department_head'),
{
  id: "evaluated-companies",
  hideForRegistrar: true,
  title: "Compare evaluated companies",
  summary: "See how students rated internship companies before placing another student there.",
  steps: [
    "Use the Evaluations menu, then open Evaluated Companies. Filter by one of your department's courses or by internship start date. Sort ratings from highest to lowest or lowest to highest.",
    "Ratings include active student evaluations from ongoing and finished internships across departments. Companies are grouped by both name and address; a missing address or several addresses for one name is flagged for review.",
    "Each student counts equally: if they submitted several evaluations for one company, those scores are averaged first. Limited feedback means fewer than three distinct student reviewers.",
    "Open a company to read individual scores. Your department's students appear by full name with remarks; students from other departments have masked names and no remarks.",
    "Only department heads outside the Registrar can open this page. Admins cannot access the ratings."
  ],
  href: "/department_head/evaluated-companies",
  linkText: "Open Evaluated Companies"
},
{
  id: "department-evaluations",
  hideForRegistrar: true,
  title: "Review department evaluations",
  summary: "Find employer-to-student performance and student-to-company evaluations across your department.",
  steps: [
    "Search by student or company and filter by evaluation type, course, status, or submission date.",
    "Employer-to-student performance evaluations are confidential: students cannot view them. Student-to-company evaluations are a separate direction.",
    "Deleted by author entries remain visible to department heads. Choose Review to open the focused evaluation, where authorized review, print, and permanent-delete actions remain. Use View placement overview to check the internship record.",
    "Only students in your current department appear. Registrar heads cannot access this page."
  ],
  href: "/department_head/evaluations",
  linkText: "Open Evaluations"
},
{
  id: "department-submissions",
  hideForRegistrar: true,
  title: "Review student submissions",
  summary: "Find narratives, summary reports, and student documents across your department.",
  steps: [
    "Search by student or company and filter by submission type, course, or submission date. Apply filters to update the paginated list.",
    "Choose Review to open that student's narratives, summary reports, or documents in Student Submissions. Use View placement overview to check the internship record.",
    "The list includes only students in your current department. Registrar heads cannot use this page."
  ],
  href: "/department_head/submissions",
  linkText: "Open Student Submissions"
},
{
  id: "department-attendance",
  hideForRegistrar: true,
  title: "Review department attendance",
  summary: "Find DTR entries across students in your department without opening each placement first.",
  steps: [
    "Search by student name, choose a course, or set a clock-in date range. Apply the filters to update the paginated list.",
    "Open View in or View out to inspect a saved timestamped attendance photo. Older and automatically closed records may have no photo.",
    "A reported missed clock-out shows the student's claimed end and explanation without a clock-out photo or location check. Open View explanation to confirm or reduce proposed hours. An automatic 16-hour closure instead says System closed and needs an explanation before review. Neither type earns hours until review. Scheduled Undertime begins one hour before expected end; without a schedule it means under seven net duty hours. Overtime requests are decided by the assigned supervisor; timing and review state remain separate.",
    "Select a student's name to open that internship's attendance details and location controls. DTR Restrictions also manages locations for one or more students.",
    "The list follows your current department membership. Registrar heads cannot access this page."
  ],
  href: "/department_head/attendance",
  linkText: "Open Attendance"
},
{
  id: "evaluation-criteria",
  hideForRegistrar: true,
  title: "Manage your department's evaluation criteria",
  summary: "Set the questions students and their supervisors answer for your department.",
  steps: [
    "Switch between Student performance and Company evaluation forms. Each form shows only your department's questions.",
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
