import { feedbackEmployer, dtrLocationGuide } from "./commonGuides";

import { bulkDtrGuide } from './bulkDtrGuide';
const employerGuides = [
{
  "id": "employer-duty-days",
  "title": "Set working days and duty hours",
  "summary": "Set schedules for your current supervised interns.",
  "href": "/dtr-restrictions",
  "steps": [
    "In DTR Restrictions, select Set hours or Edit hours for a current supervised ongoing intern. Select working days, expected clock-in/out and optional date limits. Overnight shifts use the start date.",
    "Your applicable schedule takes priority over the student's fallback schedule, including rest days. Initial schedules may start today; edits and removal apply tomorrow onward so today's duty and previous DTR results stay stable. Students are notified through the existing shift notification.",
    "Absence requests and their reasons are handled privately by the student's department head. Employers do not receive or review these reports. Your existing attendance, overtime and missed-clock-out review permissions remain available."
  ]
},
bulkDtrGuide('employer'),
{
  "id": "dashboard",
  "title": "Review your intern overview",
  "summary": "Monitor supervised interns and posted opportunities.",
  "steps": [
    "Use the dashboard's overview cards for your postings, supervised internships, and uploaded documents. The current and past intern statistics count internship records, while the supervised list counts distinct students; a student with two placements can contribute twice to a statistic but has one list card.",
    "The supervised interns list has one compact card per student. Select a student card to expand their positions, status, start dates, hours and email. Switch between All, Ongoing and Completed to filter positions. Pagination counts students, five per page. Open View profile for student details.",
    "Review your posted jobs and recent activity, or use the quick actions to manage opportunities and find students.",
    "Accept or decline supervision requests from notifications before managing a student's internship tools."
  ],
  "href": "/employer",
  "linkText": "Open dashboard"
},
feedbackEmployer,
{ id: "announcements", title: "Read announcements shared with employers", summary: "Read school updates whose author included employers.", steps: ["Open Announcements from the sidebar. Only posts whose author checked Visible to employers are included. Tagged posts additionally require you to currently supervise at least one tagged student in an ongoing internship; this applies to both General and Department announcements.", "Use search and category filters, open See more for long content, and follow announcement notifications to the shared post. Department posts show the posting department name and acronym on the card and expanded content. Employers cannot create, edit, pin or delete announcements.", "If the author turns employer visibility off or deletes the post, it is no longer available. The full Calendar page remains unavailable to employers."], href: "/announcements", linkText: "Open Announcements" },
{
  "id": "internships",
  "title": "Manage internship postings",
  "summary": "Publish and maintain opportunities students can find.",
  "steps": [
    "Open Internships or Manage Jobs on the dashboard and select Post Job.",
    "Complete the company, position, location, work type, vacancies, duration, description, requirements, and eligible courses, then post.",
    "Use search, Work Type, Courses, and My Posts to find opportunities.",
    "Use the pencil or trash controls on your own post to edit or delete it. Confirm deletion. Required missing fields keep the form open and show an error toast."
  ],
  "href": "/internships",
  "linkText": "Open Internships"
},
{
  "id": "intern-profile",
  "title": "Review a supervised student's work",
  "summary": "Use the student profile tabs available to your role.",
  "steps": [
    "Open the intern from your dashboard or Search Users. Accept the supervision request before managing an intern.",
    "An accepted supervision relationship and ongoing internship expose the permitted DTR, weekly narratives, evaluations, certificates, and profile information.",
    "In DTR, review attendance, Late/Undertime/Overtime labels and available clock-in/out photos using the Pictures buttons. Use DTR Restrictions to set a supervised intern's location and expected daily shift hours. Older and automatically closed entries may have no photo. Narratives let you read the student's saved weekly work.",
    "When an intern requests extra shift time, open Overtime request in their DTR table to approve or decline it. The student still needs to clock out normally with a photo and location. If a student reports a missed clock-out, the table shows their claimed end and explanation without a clock-out photo; open View explanation to confirm or reduce proposed hours. An automatic 16-hour closure instead says System closed and requires the student's explanation. Neither type earns hours until review. Scheduled Undertime begins one hour before expected end; without a schedule it means under seven net duty hours.",
    "In Certificates, upload one permitted certificate or supporting file up to 50 MB. The student must accept a pending upload before it counts toward a requirement. Wait for the upload result; use the file control to preview PDFs, DOCX, spreadsheets, text, or supported images. Download original file remains available.",
    "You can delete your own pending uploads. Accepted documents are managed under the student's document permissions."
  ],
  "href": "/users",
  "linkText": "Search Users"
},
{
  "id": "evaluations",
  "title": "Complete a student performance evaluation",
  "summary": "Submit confidential feedback and print the evaluation.",
  "steps": [
    "Open an accepted supervised intern's profile and select Evaluations. Submission becomes available when the internship start date arrives in Philippine time.",
    "Score every criterion and add optional remarks, then Submit Evaluation. It posts immediately without a status selector or extra posting confirmation.",
    "You can submit multiple performance evaluations during the same ongoing internship, including progress reviews required by a department. Evaluations are visible to you and authorized school staff; students cannot view them.",
    "The student's department head is notified and opens the internship record from the notification. Use the PDF control to preview, print, or download the evaluation.",
    "Delete an evaluation to hide only that entry from your summary. Staff retain the Deleted copy for review and can permanently remove it. You do not need to delete earlier evaluations to post another."
  ],
  "href": "/users",
  "linkText": "Search Users"
},
{ ...dtrLocationGuide, ...{"href":"/users","linkText":"Search Users"} },
{
  "id": "header-calendar",
  "title": "Use the header calendar",
  "summary": "Check dates without opening the planning page.",
  "steps": [
    "Select the calendar icon beside notifications for a simple month calendar.",
    "Employers do not have access to the full Calendar page; shared announcements are available separately. The header calendar has no link to the full planning page."
  ],
  "href": "/employer",
  "linkText": "Open dashboard"
}
];

export default employerGuides;
