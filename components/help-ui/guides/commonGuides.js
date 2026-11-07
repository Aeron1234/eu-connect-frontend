export const rotationsGuide = {
  id: "rotations",
  title: "Track optional company rotations",
  summary: "Record company units and dates without changing the internship or accepted supervisor.",
  steps: [
    "Rotations are optional for every academic department. Students enable them on a new record or in Company rotations above the saved Form. Pending records can enable tracking, but assignments can be added only after approval makes the internship ongoing.",
    "The owning student opens Rotations and selects Add rotation. Enter the company department or unit, start and end dates, and optional supervisor name and notes. These are company units, such as Food and Beverage or Housekeeping, rather than the student's academic department.",
    "Start on or after the internship start date and end on or after the rotation start. Rotations may extend beyond the estimated internship end date while the record remains ongoing. Date ranges cannot overlap, including boundary days; a following assignment must start after the previous one ends.",
    "The current assignment is based on today's date. No assignment for today can mean a future assignment or a gap, rather than a loading error. Use View rotations in a compact panel to expand the saved timeline.",
    "The student can edit or remove assignments while tracking is enabled on an ongoing record. Confirm removals. Turn off preserves the timeline; finished records remain read-only. A named rotation supervisor does not become the platform supervisor, and rotations do not reset duty hours.",
    "When submitting a weekly narrative, students can optionally select assignments overlapping its coverage dates. A week spanning two units can include both. Saved narrative labels remain as recorded after later rotation edits, deletion or disabling.",
    "Authorized staff read rotations in internship record details. In a searched student's Info tab, only that student's own department head sees the rotation panel. Finding a profile or being named as a rotation supervisor does not grant private record access.",
    "Wait for the skeleton to finish. If loading fails, use Retry. Previously loaded assignments stay visible during a refresh failure, but editing is unavailable until a successful refresh."
  ],
  href: "/department_head/internship-records",
  linkText: "Open Records"
};

export const mapGuide = {
  "id": "map",
  "title": "Plan visits with the student map",
  "summary": "Compare cities, inspect interns, and display a road route.",
  "steps": [
    "Search by student, company, or course and choose a department and region. The Departments dropdown shows acronyms such as CCS and CITHM; select Departments to show all. Both filters span the available width on small screens. Map View, Visit by city, Companies, and recommendations use these filters.",
    "In Map View, select a company pin to open its details from the left edge of the map. The pin number counts interns matching your search, department, and region. A company with interns from several departments shows only matching students when a department is selected. Scroll inside the panel and use the small panel icon to reopen it.",
    "Visit by city stays on the Map View, beside the map on large screens and below it on small screens. Expand a city for companies and student names within your current filters. Sort by students, companies, or city name.",
    "Open Recommendations to compare cities with the most students. Ties favor the nearest company by straight-line distance from the route starting point. This is a starting suggestion, not a complete driving itinerary.",
    "Open Location to keep MSEUF-Candelaria as your starting point or choose Use my location and allow browser access. Your position updates while this page is open; select Use Candelaria instead or leave the page to end it.",
    "Select Show road route for a company. Details stay open during loading or failure and close once the route succeeds. Reopen the panel for distance and estimated driving time; traffic and stops are excluded.",
    "If routing fails, use Open Google Maps directions. Google Maps is also the better choice for navigation while travelling; this map does not provide turn-by-turn guidance.",
    "Switch to Companies to browse the same results as cards. On small screens, use the Location and Recommendations buttons to open their compact dialogs."
  ],
  "href": "/map",
  "linkText": "Open Map"
};

export const recordsGuide = {
  "id": "records",
  "title": "Review internship records",
  "summary": "Approve, reject, restore, and inspect internship placements.",
  "steps": [
    "Search by student, company, or course and select a status tab. Use See more to load additional records.",
    "Review Pending Approval records before approving or rejecting them. Reject opens a confirmation with a required reason of up to 1,000 characters. The student sees this exact note in their notification and rejected record card. If saving fails, the dialog stays open with the entered reason. Approval makes a record ongoing; Restore returns a rejected record to pending and clears its saved rejection reason, while earlier notifications remain as history, and Mark Finished completes an ongoing record.",
    "Select a student's name or View Record to open the placement overview. Use the Attendance, Student Submissions, and Evaluations links when you need to review that student's work; those tools also have department-wide lists in the sidebar.",
    "In Overview, open Company website to review the company's official website or social media page in a new tab alongside the placement details. Older records without a website display a dash (-).",
    "Overview uses a building icon; Rotations uses repeat arrows. For records with tracking enabled or saved rotation history, open Rotations for the dated timeline. The Company rotations panel in Overview shows the current assignment and View rotations. Staff can read assignments but only the owning student manages them; company units do not change the academic department, accepted supervisor, or duty hours.",
    "Rotations may continue past the estimated internship end date while the record is ongoing. Finished records keep their timeline available for review. Student Submissions shows narratives and their saved rotation labels, including in printed journals.",
    "In Overview, click the company pin and choose See on Google Maps to open campus-to-company directions in a new tab.",
    "Attendance shows saved shifts, break time, credited hours, and clock-in/out photos. DTR Restrictions manages location pins and radii. Review these before marking an internship finished.",
    "Evaluations lists confidential employer performance evaluations and student evaluations of supervisors. A notification or list entry opens the focused evaluation. Authorized staff can preview, print, download, and permanently delete an author-deleted copy there.",
    "Mark Finished is a staff completion decision and does not require credited hours to meet the required total. Check the student's record first. The student's Finish Internship Record control requires the hours target and no open shift. Completion preserves history; it does not delete attendance, narratives or rotations."
  ],
  "href": "/department_head/internship-records",
  "linkText": "Open Records"
};

export const pastGuide = {
  "id": "past-internships",
  "title": "Browse past internships",
  "summary": "Find alumni placements by company, department, and academic year.",
  "steps": [
    "Search for a company or alumnus and combine the Academic Year and Departments filters. Department choices use acronyms such as CCS; Departments shows all departments.",
    "Open a company to see the alumni placement entries matching your filters. Use See more when more results are available.",
    "This page lists historical alumni placements. Your personal internship documents are in Storage.",
    "Department heads outside the registrar can select Post Record for their department. Enter the required alumni, company, industry, course, address, batch year, and academic year; position, hours, supervisor, and notes are optional.",
    "Those department heads can edit or delete entries in their department with the pencil or trash controls. Confirm deletion. If required details are missing, the form stays open and an error toast identifies what to complete."
  ],
  "href": "/past-internships",
  "linkText": "Open Past Internships"
};

export const pdfGuide = {
  "id": "pdf-preview",
  "title": "Preview, print, and download PDFs",
  "summary": "Review generated reports before saving or printing.",
  "steps": [
    "Select Export PDF or an available PDF preview control. Wait for the preview to load; reports do not download automatically.",
    "The preview starts at 75%. Use page navigation, zoom, or Fit width to inspect the document.",
    "Select Print to print all PDF pages, or Download to save the original PDF. If loading fails, use Retry. Uploaded non-PDF files have a 25 MB browser-preview limit. A file can be accepted for upload yet exceed this preview limit; use Download original file in that case. Partial previews show a notice and require the original file for full printing.",
    "DOCX, XLS, XLSX, CSV, text, and supported images open in the same preview-style dialog with Download original file. Select a worksheet to preview and print it. Word prints all document pages when the preview is complete. Browser previews may lay out Word files differently from Microsoft Word; use the original file when exact original formatting is needed. Legacy .doc files cannot be previewed and keep the original download option."
  ],
  "href": "/help",
  "linkText": "Open Help"
};

export const feedbackEmployer = {
  "id": "feedback",
  "title": "Use Feedback & Concerns",
  "summary": "Post private feedback, tag interns, and follow the discussion.",
  "steps": [
    "Select Create feedback. Choose a category and enter the subject and description. Only employers create these posts.",
    "General Feedback is visible to you, Admin, and all department heads. Platform Feedback and Technical Issue are visible only to you and Admin.",
    "For Internship Feedback & Concerns, optionally tag one or more ongoing or finished internships assigned to you. The department heads of the tagged students can see the whole discussion and receive notifications. Without tags, only you and Admin can see it. Check the audience shown in the form.",
    "Optionally attach up to three PDF, JPG, PNG, or WebP files, each 5 MB or smaller. Images appear inline and can be enlarged. PDFs open in the preview with Print and Download; use the download icon to save an attachment explicitly.",
    "Use search, Category, Status, and the page controls to find posts. Select a post to open its discussion. On small screens, use the back arrow to return to the feed.",
    "Reply in the discussion. Staff manage Open, In review, and Resolved status; a resolved discussion must be reopened by staff before you can add another reply.",
    "Use the pencil or trash controls on your own post or reply to edit or delete it. When editing a post you can change its category, tags, and attachments; check the updated audience.",
    "Deleting a post permanently removes its discussion, replies, and attachments. Confirm carefully. If file cleanup is delayed, the notice explains that cleanup will be retried.",
    "Students and unrelated employers cannot view the discussion. Staff internal notes are hidden from employers."
  ],
  "href": "/feedback",
  "linkText": "Open Feedback & Concerns"
};

export const feedbackStaff = {
  "id": "feedback",
  "title": "Use Feedback & Concerns",
  "summary": "Review shared concerns, reply, and manage their resolution.",
  "steps": [
    "Use search, Category, Status, and the page controls to find discussions shared with you. Select a post; on small screens use the back arrow to return to the feed.",
    "General Feedback is shared with all department heads and Admin. Technical Issue and Platform Feedback are shared only with Admin and the employer author.",
    "Internship Feedback & Concerns is shared with Admin, the author, and department heads of tagged students. Those heads receive notifications and can see the whole discussion. Students and unrelated employers cannot access it.",
    "Reply publicly to the discussion audience, or select Internal note to keep a reply visible only to authorized school staff. Employers cannot see internal notes.",
    "Change status to Open, In review, or Resolved as work progresses. Reopen a resolved discussion before adding another reply.",
    "You can edit or delete your own replies and internal notes with their pencil or trash controls. Only the employer author can edit or delete the original post; staff cannot remove another author's replies.",
    "Images appear inline and can be enlarged. PDFs open in the preview with Print and Download. The download icon saves an attachment explicitly. Only employers create posts or change their attachments."
  ],
  "href": "/feedback",
  "linkText": "Open Feedback & Concerns"
};

export const calendarStudent = {
  "id": "calendar",
  "title": "Plan days on the calendar",
  "summary": "See dated updates and keep private internship to-dos.",
  "steps": [
    "Use the arrows to change months and Today to return to the current date. Select a day to read its agenda.",
    "Use the checkboxes to show or hide item types. Announcement events and schedules with date ranges appear on every included day.",
    "Select a day within your saved ongoing internship start and end dates and choose Add to-do. Enter a title and save. Your tasks are private. This calendar date range is separate from rotation dates; adding a rotation beyond the estimated end does not change the calendar's eligible dates.",
    "In the agenda, use the checkmark to complete or reopen a task, the pencil to edit it, or the trash icon to delete it after confirmation."
  ],
  "href": "/calendar",
  "linkText": "Open Calendar"
};

export const calendarStaff = {
  "id": "calendar",
  "title": "Publish calendar schedules",
  "summary": "Share dated schedules and manage the day agenda.",
  "steps": [
    "Use the arrows to change months and Today to return to the current date. Select a day to read its agenda.",
    "Use the checkboxes to show or hide item types. Announcement events and schedules with date ranges appear on every included day.",
    "Select a day and Add schedule. Enter the title, optional details, and start and end dates, then Publish schedule. Check the audience indicated by your role before publishing.",
    "Department-head schedules notify students in their department; Admin schedules are school-wide.",
    "Open a scheduled day to edit or delete your own schedule. Admin can also manage other schedules. Confirm deletion."
  ],
  "href": "/calendar",
  "linkText": "Open Calendar"
};

export const deptAnnouncements = {
  "id": "announcements",
  "title": "Post department announcements",
  "summary": "Share department updates and optional event date ranges.",
  "steps": [
    "Select Announce. Your category is Department; regular department heads cannot post General announcements but can read them.",
    "Enter the title and content. Optionally choose Event date and Until date for an inclusive date range. Until date requires Event date and cannot be earlier; leave it blank for a one-day event.",
    "Optionally check Visible to employers to share this post with employers as well as its usual school audience. Optionally search and tag up to 100 ongoing students: only their current supervising employers can then view it and receive employer notifications. Without tags, all employers are included. Regular heads tag their department; admins and Registrar heads can tag all ongoing interns. Selections remain while searching and can be removed or changed when editing. Students without supervisors do not grant employer access. Adding tags automatically restricts viewing to tagged students, their department heads, the author and admins. Remove all tags to choose the usual broad department/General audience. Targeted mode requires a tag. Only involved students/heads are notified; admins retain access without an automatic alert. The employer option starts unchecked. You can change it when editing; turning it off removes employer access and its saved employer alerts. Post the announcement. Dated events appear on permitted calendars; this option does not grant employers full Calendar access.",
    "Use search and the category filter to find posts, and See more to read long content. Use available author controls to edit, pin or unpin, or delete your own posts; confirm deletion. Pinning is limited to announcements you can currently view. Pin changes refresh other open sessions without notification toasts. Editing text does not resend dismissed alerts; audience changes notify newly included people only. If a request times out, refresh before retrying to check whether it was saved."
  ],
  "href": "/announcements",
  "linkText": "Open Announcements",
  "hideForRegistrar": true
};

export const generalAnnouncements = {
  "id": "announcements",
  "title": "Post general announcements",
  "summary": "Share school-wide updates and optional event date ranges.",
  "steps": [
    "Select Announce. Admin and registrar department heads post in General; the form offers only this category.",
    "Enter the title and content. Optionally choose Event date and Until date for an inclusive date range. Until date requires Event date and cannot be earlier; leave it blank for a one-day event.",
    "Optionally check Visible to employers to share this post with employers as well as its usual school audience. Optionally search and tag up to 100 ongoing students: only their current supervising employers can then view it and receive employer notifications. Without tags, all employers are included. Regular heads tag their department; admins and Registrar heads can tag all ongoing interns. Selections remain while searching and can be removed or changed when editing. Students without supervisors do not grant employer access. Adding tags automatically restricts viewing to tagged students, their department heads, the author and admins. Remove all tags to choose the usual broad department/General audience. Targeted mode requires a tag. Only involved students/heads are notified; admins retain access without an automatic alert. The employer option starts unchecked. You can change it when editing; turning it off removes employer access and its saved employer alerts. Post the announcement. Dated events appear on permitted calendars; this option does not grant employers full Calendar access.",
    "Search or filter the feed and select See more for long content. Edit your own posts and use the available pin or delete controls. Admin can also pin or delete other authors' posts; confirm deletion. Pinning is limited to announcements you can currently view. Pin changes refresh other open sessions without notification toasts. Editing text does not resend dismissed alerts; audience changes notify newly included people only. If a request times out, refresh before retrying to check whether it was saved. On Department posts, Admin sees the author's department name and acronym on the card and expanded content."
  ],
  "href": "/announcements",
  "linkText": "Open Announcements",
  "hideForRegistrar": false
};

export const dtrLocationGuide = {
  "id": "dtr-location",
  "title": "Set a student's DTR location",
  "summary": "Place the attendance pin and choose its permitted radius.",
  "steps": [
    "Open DTR Restrictions in the sidebar to select one or many authorized ongoing interns and set an attendance location. Department heads can also open a student's Attendance detail; employers use the profile of an intern whose supervision request they accepted.",
    "Search for the workplace or place the map pin manually. A short delay prevents repeated location searches; wait for the loading indicator and suggestions. Choose an allowed radius from 20 to 2,000 metres and optionally add a location label.",
    "Ask the student to Share location from their dashboard when needed. Check the temporary position and accuracy circle before choosing the workplace pin and attendance radius.",
    "Save the location and ask the student to stop sharing after setup. Map position sharing does not replace the separate location checks when clocking in or out.",
    "Remove a saved custom DTR location only after reviewing the confirmation: attendance returns to the saved company location and default radius. Removing an unsaved pin only clears that form selection."
  ],
  "href": "/dtr-restrictions",
  "linkText": "Open DTR Restrictions"
};
