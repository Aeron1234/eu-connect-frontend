import { feedbackEmployer, dtrLocationGuide } from "./commonGuides";

const employerGuides = [
{
  "id": "dashboard",
  "title": "Review your intern overview",
  "summary": "Monitor supervised interns and posted opportunities.",
  "steps": [
    "Use the dashboard's overview cards for your internships, interns, and documents.",
    "In the supervised interns list, switch between ongoing and finished placements and use its filters and page controls. Check hours and internship dates, then open a student's profile for details.",
    "Review your posted jobs and recent activity, or use the quick actions to manage opportunities and find students.",
    "Accept or decline supervision requests from notifications before managing a student's internship tools."
  ],
  "href": "/employer",
  "linkText": "Open dashboard"
},
feedbackEmployer,
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
    "In DTR, review attendance or use Set DTR Location. Narratives let you read the student's saved weekly work.",
    "In Certificates, upload the permitted certificate or supporting file. Wait for the upload result; use the file control to preview PDFs, DOCX, spreadsheets, text, or supported images. Download original file remains available.",
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
    "Employers do not have access to the full Calendar page or Announcements. The header calendar has no link to the full planning page."
  ],
  "href": "/employer",
  "linkText": "Open dashboard"
}
];

export default employerGuides;
