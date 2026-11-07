import { calendarStudent, pastGuide, rotationsGuide } from "./commonGuides";

const studentGuides = [
{
  "id": "dashboard",
  "title": "Use your student dashboard",
  "summary": "Track attendance, missing requirements, and internship progress.",
  "steps": [
    "Check your ongoing internship, required hours, and completed hours on the dashboard. The statistics show favorite opportunities, unread announcements, stored documents, and missing requirements. Select Missing Requirements to open Storage. With no ongoing internship, start in My Records.",
    "Missing Requirements counts before- and after-deployment categories without a qualifying file for your ongoing internship. Open the card to go to Storage. Duplicate uploads and files from other internships do not satisfy extra categories; employer files count after you accept them.",
    "Use the Today card for attendance and Recent Time Records to review saved shifts. Breaks pause counted duty time.",
    "Use the map's Share location only when authorized staff need your temporary position to set a DTR location. Staff can view that pin from the individual record or DTR Restrictions page; sharing does not change your saved attendance area. Allow browser access and keep the page open while they check the pin, then select Stop sharing or leave the page.",
    "Sharing a position and clocking attendance are separate actions. Each clock action checks your current position. Once credited hours reach your required total and you have clocked out, Finish Internship Record appears on Today. Review your saved work before confirming completion; it moves the internship to finished history."
  ],
  "href": "/student",
  "linkText": "Open dashboard"
},
{
  "id": "student-record",
  "title": "Start an internship record",
  "summary": "Manage your placement, rejection feedback, and optional company rotations.",
  "steps": [
    "Open the Form tab in My Records. Enter the required company, region, position, dates, semester, hours, description, and location details. Enter start and estimated end dates as MM/dd/yyyy, or choose them using the calendar buttons. Company website is required for new submissions and pending edits; use the company's official website or official social media page so your department head can review it.",
    "Search the map for the company or select its pin location. Review the address, city or municipality, and province. Wait for the location search suggestions while it loads.",
    "Select Create Internship Record. Your record appears as Pending while your department head reviews it.",
    "Company rotations are optional for every academic department. For a new record, select This internship includes company rotations in the form. For a saved pending or ongoing record, find Company rotations above the form and select Enable rotations. The Rotations tab appears when tracking is enabled or saved assignments exist.",
    "Open Rotations, or View rotations above the form, for the current assignment and timeline. Once approved, add the company unit, dates, and optional supervisor or notes. Open the Company rotations info icon for date rules, editing, retained history, and linking assignments to narratives.",
    "If a record is rejected, open Records to read Reason for rejection on its card. The rejection notification contains the same note. If staff restore the record, its status returns to Pending and the reason is removed from the card; the old notification remains as history.",
    "Finished internships keep their saved rotation history read-only in Records. Disabling tracking does not erase assignments; enable it again on an eligible current record to resume managing them.",
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
    "An approved ongoing internship whose start date has arrived in Philippine time is required. Allow browser location access on HTTPS or localhost. Attendance uses the company location unless your supervisor or authorized staff saves a custom DTR pin and radius. Individual or bulk assignments notify you with the location, radius and clock-in/out instructions. Review your notification and dashboard attendance location; ask your supervisor or coordinator to correct an inaccurate area. Students cannot open the DTR Restrictions management page.",
    "At the approved location, select Clock in on Today. Allow camera access, take a clear photo, review it or retake it, then confirm Clock in. The app checks your current location when you submit and stamps the official Philippine clock-in time onto the saved photo.",
    "You can start one shift per Philippine calendar day. A night shift belongs to the date when you clock in, even if you clock out after midnight. After clocking out, wait at least six hours before your next shift; the app also prevents another start while a shift is still open.",
    "Select Start break and confirm when pausing work. Select Resume duty when you return; break time is excluded from counted duty.",
    "Resume from any break before Clock out. Take and review a new required photo before confirming. Your current position is checked again, and the official Philippine clock-out time is stamped onto that saved photo.",
    "Near the scheduled end, choose Continue for overtime, explain why, and enter your intended end time. Without a schedule, the option appears after eight duty hours. Your supervisor may approve or decline the request. You can still clock out normally while it is pending; the request does not add hours beyond the school's daily credit cap.",
    "If a shift stays open for 12 wall hours, Today warns you and the hourly job sends one reminder notification. At 16 wall hours, the system closes it without a clock-out photo or location check and credits no hours yet. On your next visit, open Add explanation in Recent Time Records and explain why you missed clock-out. You cannot start another shift until you submit that explanation. A supervisor or your department head then reviews how many hours to credit. For older shifts marked Previously credited, Add explanation is optional and does not change credited hours. The DTR row shows the review state separately from Late, Undertime and Overtime.",
    "If your supervising employer sets daily shift hours, you receive a notification. The employer may limit the hours to a start date, end date, or both. The Timing column shows Late when you clock in at least 10 minutes after the expected start, Undertime when you manually clock out before the expected end, or Overtime when you clock out at least 30 minutes after the expected end. More than one timing label can appear for a shift; attendance stays in the separate Status column. Overnight shifts are supported. These labels do not block clocking or change your credited hours; an entry made before shift hours were set keeps its original result.",
    "Today shows your remaining required internship hours and, when your employer has set shift hours, the expected clock-in and clock-out times beside your actual attendance. Remaining hours use credited time and never fall below zero; an open shift is not yet included. Check Recent Time Records below. Use the Pictures buttons to view saved clock-in and clock-out evidence; older entries may have no photos. If location checks fail, review browser permission and your distance from the approved pin. A server location-storage error must be corrected by your coordinator or administrator; changing the browser's permission will not fix it. Refresh after an uncertain save to check the recorded status before repeating the action."
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
    "If rotations are enabled, check the suggested company departments for your coverage dates, including work after the estimated internship end date while the record is ongoing. Select both when a week spans two units. Selected departments appear on cards and printed journals; assignment selection is optional. If assignment loading fails, use Retry before saving. Saved narrative assignment labels remain as recorded when the timeline is later edited or an assignment is removed.",
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
    "Older reports may include document attachments. Open them in the shared preview, then Print or Download original file. Older .doc files need to be downloaded."
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
    "Select Upload File. Enter the company and file names, choose its requirement category and one PDF, TXT, DOC, DOCX, XLS, or XLSX file up to 10 MB, then Save. The categories shown determine which requirement the file satisfies.",
    "Wait for the loading toast to finish. An upload failure shows an error; if a request times out, refresh the list before retrying to check whether the file was saved.",
    "Use category filters, search, and grid or list view to find documents. The file control opens a preview. PDFs use the PDF viewer; DOCX, spreadsheets, text, and supported images offer Print and Download original file. Older .doc files offer an original download.",
    "Use the trash control where available to delete a document. Review eligible pending documents uploaded by your supervisor before accepting them with the check control. Acceptance counts the document toward its requirement; an unaccepted supervisor upload does not satisfy Missing Requirements.",
    "Find files from earlier internships in the past-internship section of Storage. Past Internships in the sidebar is the separate alumni placement directory."
  ],
  "href": "/student/storage",
  "linkText": "Open Storage"
},
{
  "id": "evaluations",
  "title": "Evaluate your supervisor",
  "summary": "Evaluate your supervisor more than once during the same ongoing internship.",
  "steps": [
    "An ongoing internship with an accepted supervisor is required. Open Evaluate Supervisor and review the 0-5 grade scale. Select a score for every criterion and add optional remarks.",
    "Select Submit Evaluation. It is posted immediately without a separate status choice or posting confirmation. You can return to the form and submit another evaluation for the same ongoing internship.",
    "Past Evaluations lists each submission separately, including several evaluations for the same internship. Earlier evaluations do not block a new submission.",
    "You may delete one of your evaluations without affecting the others. It disappears from your history, but authorized staff keep a Deleted copy for review.",
    "Your employer's performance evaluation of you is confidential and is not visible to students."
  ],
  "href": "/student/evaluations",
  "linkText": "Open Evaluations"
},
{ ...rotationsGuide, href: "/student/internship-record", linkText: "Open My Records" },
calendarStudent,
pastGuide
];

export default studentGuides;
