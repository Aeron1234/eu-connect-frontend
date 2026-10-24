import { pdfGuide } from "./commonGuides";

const sharedGuides = [
{
  "id": "announcements",
  "title": "Read announcements",
  "summary": "Follow general and department updates with their event dates.",
  "steps": [
    "Search the announcement feed or choose a category, then See more to read long posts.",
    "General updates and department posts are shown according to your access. An event with start and end dates appears on every included calendar day.",
    "Employers do not have access to Announcements."
  ],
  "href": "/announcements",
  "linkText": "Open Announcements",
  "hideForEmployer": true,
  "studentOnly": true
},
{
  "id": "internships",
  "title": "Find internship opportunities",
  "summary": "Search available roles and return to favorites.",
  "steps": [
    "Search by company or position and use Work Type and Courses to narrow the list.",
    "Students can select Mark as Favorite to save a post and select it again to remove the favorite. Use the favorite filter to return to saved opportunities.",
    "School staff can browse opportunities. Employers create and manage their own posts."
  ],
  "href": "/internships",
  "linkText": "Open Internships",
  "hideForEmployer": true
},
{
  "id": "notifications",
  "title": "Check notifications",
  "summary": "Open related pages and manage unread updates.",
  "steps": [
    "Select the header bell for recent notifications and use its page controls for older items.",
    "Select a notification to open the related page. Feedback notifications open the discussion; department-head notifications about employer evaluations open the internship record.",
    "Open Notifications for the full list. Mark items as read, use Mark all as read, or delete a notification.",
    "Employers can accept or decline eligible supervisor requests from the request's notification controls."
  ],
  "href": "/notifications",
  "linkText": "Open Notifications"
},
{
  "id": "users",
  "title": "Search users and return to profiles",
  "summary": "Find people and review the information your role permits.",
  "steps": [
    "Enter at least three characters of a person's name in Search Users, then select a result.",
    "When the search is empty, revisit a recently viewed profile. Remove one history entry with X or use clear all.",
    "Students can use Set as Supervisor on an eligible employer's profile and manage the request status there. Employers respond to requests from notifications.",
    "Student internship tabs require the appropriate role and supervision or department access; finding a profile does not grant access to confidential evaluations."
  ],
  "href": "/users",
  "linkText": "Search Users"
},
{
  "id": "account",
  "title": "Update your account or password",
  "summary": "Manage profile details and account security.",
  "steps": [
    "Open your account from the profile card near the bottom of the sidebar.",
    "Select Edit Profile, change the fields available to your role, then Save Changes. Cancel discards unsaved profile edits.",
    "Use the security section to change your password. Enter your current password, a new password of at least eight characters, and matching confirmation, then check the result message."
  ],
  "href": null,
  "linkText": "Open my account"
},
pdfGuide,
{
  "id": "unavailable-tools",
  "title": "Why is an internship tool unavailable?",
  "summary": "Check your internship status, dates, and browser permissions.",
  "steps": [
    "Check My Records: pending or rejected records do not unlock ongoing-internship tools.",
    "Narrative creation and editing, and summary report creation and editing, also require the internship start date to have arrived in Philippine time. A missing start date must be corrected by staff.",
    "Allow browser location access when using attendance or location sharing. These features also depend on device location and an approved attendance area.",
    "If a form reports missing details, complete the highlighted field and submit again. For a failed read, use Retry; for an uncertain upload timeout, refresh the file list before repeating it."
  ],
  "href": "/student/internship-record",
  "linkText": "Open My Records",
  "studentOnly": true
}
];

export default sharedGuides;
