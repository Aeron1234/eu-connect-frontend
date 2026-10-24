import { calendarStudent, pastGuide } from "./commonGuides";

const studentGuides = [
{
  "id": "dashboard",
  "title": "Use your student dashboard",
  "summary": "Track attendance, hours, and recent internship activity.",
  "steps": [
    "Check your ongoing internship, required hours, and completed hours on the dashboard.",
    "Use the Today card for attendance and Recent Time Records to review saved shifts. Breaks pause counted duty time.",
    "Use the map's Share location only when authorized staff need your temporary position to set a DTR location. Allow browser access and keep the page open; Stop sharing or leave the page when finished.",
    "Sharing a position and clocking attendance are separate actions. Each clock action checks your current position."
  ],
  "href": "/student",
  "linkText": "Open dashboard"
},
{
  "id": "student-record",
  "title": "Start an internship record",
  "summary": "Create a placement and understand approval and start-date restrictions.",
  "steps": [
    "Open the Form tab in My Records. Enter the required company, region, position, dates, semester, hours, description, and location details; the company website is optional.",
    "Search the map for the company or select its pin location. Review the address, city or municipality, and province. Wait for the location search suggestions while it loads.",
    "Select Create Internship Record. Your record appears as Pending while your department head reviews it.",
    "While pending, select Edit at the bottom of Form, change the details, then Save changes or Cancel. Pending and rejected records can be deleted from Records.",
    "Once approved, the record becomes ongoing and its form is locked. Narratives and summary reports also wait until the start date arrives in Philippine time. Ask your department to correct a missing start date."
  ],
  "href": "/student/internship-record",
  "linkText": "Open My Records"
},
{
  "id": "dtr",
  "title": "Clock in, take a break, and clock out",
  "summary": "Record attendance from your assigned workplace.",
  "steps": [
    "An approved ongoing internship and an available start date are required. Ask your supervisor or authorized staff to set an accurate DTR location and radius.",
    "At the approved location, select Clock in on Today, allow browser location access, and confirm with Save.",
    "Select Start break and confirm when pausing work. Select Resume duty when you return; break time is excluded from counted duty.",
    "Resume from any break before Clock out and confirm with Save. Your current position is checked again.",
    "Check today's status and Recent Time Records below. If location checks fail, review browser permission and your distance from the approved pin; ask staff to review an inaccurate attendance area."
  ],
  "href": "/student",
  "linkText": "Open dashboard"
},
{
  "id": "narratives",
  "title": "Submit weekly narratives",
  "summary": "Save weekly reflections with the dates covered.",
  "steps": [
    "Choose an ongoing or finished internship to view its entries. Finished records can be reviewed and printed.",
    "Once your ongoing internship reaches its start date in Philippine time, select New Narrative.",
    "Enter the week number, title, start and end dates covered, and narrative. End date cannot precede start date. Save the entry; its date range appears on the card and in the printed journal.",
    "Select See more to read a long entry. Use the pencil to edit an entry while its internship is ongoing and has started, or the trash icon to delete an entry when available; confirm deletion.",
    "Select Export PDF to preview all entries for the selected internship, then Print or Download. Older entries without a saved range do not receive invented coverage dates."
  ],
  "href": "/student/narratives",
  "linkText": "Open Narratives"
},
{
  "id": "summary-reports",
  "title": "Write a summary report",
  "summary": "Build one report per internship and include memorabilia images.",
  "steps": [
    "Choose an approved ongoing or finished internship. You can create or edit its report once its start date arrives in Philippine time; you need not wait for completion.",
    "Write paragraphs about the organization, work schedule, a memorable moment, and difficulties with their solutions. Keep the report within 900 words and the three-page limit shown by the form.",
    "Optionally add a memorabilia note and up to six JPG, PNG, or WebP images, each 5 MB or smaller. Review the images before saving.",
    "Select Submit report. Only one report can exist for an internship; use the available controls to edit it or delete it after confirmation.",
    "Select Export PDF to preview the school template and saved images, then Print or Download.",
    "Older reports may include document attachments. Their open control uses a separate browser tab; Word or Excel attachments may download rather than preview."
  ],
  "href": "/student/summary-reports",
  "linkText": "Open Summary Reports"
},
{
  "id": "storage",
  "title": "Manage internship documents",
  "summary": "Upload requirements, review files, and find documents from earlier placements.",
  "steps": [
    "Review the Before Deployment and After Deployment lists for your ongoing internship's requirements.",
    "Select Upload File. Enter the company and file names, choose its requirement category and a PDF, text, Word, or Excel file, then Save.",
    "Wait for the loading toast to finish. An upload failure shows an error; if a request times out, refresh the list before retrying to check whether the file was saved.",
    "Use category filters, search, and grid or list view to find documents. The file control previews PDFs with Print and Download. Other file types open in a new browser tab and may download.",
    "Use the trash control where available to delete a document. You can also approve eligible pending documents uploaded by your supervisor using the check control.",
    "Find files from earlier internships in the past-internship section of Storage. Past Internships in the sidebar is the separate alumni placement directory."
  ],
  "href": "/student/storage",
  "linkText": "Open Storage"
},
{
  "id": "evaluations",
  "title": "Evaluate your supervisor",
  "summary": "Submit feedback once per active internship evaluation.",
  "steps": [
    "Open Evaluate Supervisor and review the 0-5 grade scale. Select a score for every criterion and add optional remarks.",
    "Select Submit Evaluation. It is posted immediately without a separate status choice or posting confirmation.",
    "Past Evaluations shows your submitted supervisor feedback. Only one active evaluation is allowed per internship.",
    "Delete your own evaluation if you need to submit a replacement. It disappears from your summary, but authorized staff keep a Deleted copy for review.",
    "Your employer's performance evaluation of you is confidential and is not visible to students."
  ],
  "href": "/student/evaluations",
  "linkText": "Open Evaluations"
},
calendarStudent,
pastGuide
];

export default studentGuides;
