export const mapGuide = {
  "id": "map",
  "title": "Plan visits with the student map",
  "summary": "Compare cities, inspect interns, and display a road route.",
  "steps": [
    "Search by student, company, or course and choose a region. Map View, Visit by city, Companies, and recommendations use these filters.",
    "In Map View, select a company pin to open its details from the left edge of the map. The pin number is the intern count. Scroll inside the panel and use the small panel icon to reopen it.",
    "Visit by city stays on the Map View, beside the map on large screens and below it on small screens. Expand a city for companies and student names across departments. Sort by students, companies, or city name.",
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
  "summary": "Approve placements and inspect attendance, reports, and confidential evaluations.",
  "steps": [
    "Search by student, company, or course and select a status tab. Use See more to load additional records.",
    "Review Pending Approval records before approving or rejecting them. Confirm the action. Approval makes a record ongoing; Restore returns a rejected record to pending, and Mark Finished completes an ongoing record.",
    "Select a student's name or View Record to open the overview, DTR, narratives, summary report, evaluations, and documents available to you.",
    "In Overview, click the company pin and choose See on Google Maps to open campus-to-company directions in a new tab.",
    "In DTR, authorized staff can set the attendance pin and radius for an ongoing record. Ask the student to share their dashboard location if you need help placing the pin.",
    "Employer performance evaluations are confidential to the employer and authorized staff. Evaluation notifications open the related internship record. Use the available PDF control to preview, print, or download.",
    "Deleted evaluations remain visible to authorized staff with a Deleted label. Staff can permanently delete these copies; authors can submit a replacement after deleting their active evaluation."
  ],
  "href": "/internship-records",
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
    "Select Print to print all PDF pages, or Download to save the original PDF. If loading fails, use Retry. Large non-PDF previews can be limited; partial previews show a notice and require the original file for full printing.",
    "DOCX, XLS, XLSX, CSV, text, and supported images open in the same preview-style dialog with Download original file. Select a worksheet to preview and print it. Word prints all document pages. Legacy .doc files cannot be previewed and keep the original download option."
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
    "For Internship Feedback & Concerns, optionally tag one or more internships you supervise. The department heads of the tagged students can see the whole discussion and receive notifications. Without tags, only you and Admin can see it. Check the audience shown in the form.",
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
    "Select a day within your ongoing internship dates and choose Add to-do. Enter a title and save. Your tasks are private.",
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
    "Post the announcement. Its dated event appears on the calendar for people who can view it.",
    "Use search and the category filter to find posts, and See more to read long content. Use available author controls to edit, pin or unpin, or delete your own posts; confirm deletion."
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
    "Post the announcement. Its dated event appears on the calendar for people who can view it.",
    "Search or filter the feed and select See more for long content. Edit your own posts and use the available pin or delete controls. Admin can also pin or delete other authors' posts; confirm deletion."
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
    "Open an ongoing internship's DTR tab and select Set DTR Location. Employers use the profile of an intern whose supervision request they accepted.",
    "Search for the workplace or place the map pin manually. A short delay prevents repeated location searches; wait for the loading indicator and suggestions.",
    "Ask the student to Share location from their dashboard when needed. Check the temporary position and accuracy circle before choosing the workplace pin and attendance radius.",
    "Save the location and ask the student to stop sharing after setup. Map position sharing does not replace the separate location checks when clocking in or out."
  ],
  "href": "/internship-records",
  "linkText": "Open Records"
};
