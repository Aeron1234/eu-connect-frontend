"use client";

import { useUser } from "@/contexts/UserContext";
import ManualDialog from "./ManualDialog";
import HelpManual from "@/components/help-ui/HelpManual";

const pageGuides = {
  "admin-error-tracking": "error-tracking",
  "admin-cache-monitoring": "cache-monitoring",
  "admin-accounts": "accounts",
  "admin-departments": "departments",
  "admin-activity-logs": "activity-logs",
  "department-head-evaluation-criteria": "evaluation-criteria",
  announcements: "announcements",
  internships: "internships",
  users: "users",
  feedback: "feedback",
  notifications: "notifications",
  account: "account",
  dashboard: "dashboard",
  sipp: "sipp",
  records: "records",
};

function PageManual({ page, searchedRole, hasOngoingInternship = false, supervisionStatus, onBrand = false }) {
  const { user } = useUser();
  const role = user?.role;
  if (pageGuides[page]) return <HelpManual guideId={pageGuides[page]} onBrand={onBrand} />;

  let title;
  let steps;
  if (page === "user-profile" && role === "student" && searchedRole === "employer") {
    title = "How to manage your supervisor";
    steps = [
      "Review the employer's profile and select Set as Supervisor when available to request supervision.",
      "In Info, Supervised interns appears below the employer details when ongoing or completed placements exist. Each student has one card listing all ongoing and completed positions and dates under that supervisor, with five students per page. Open a student's View profile link or use Previous and Next for more history. Every signed-in role can see these basic placement details; student work tabs keep their normal access rules.",
      "Check the button for the request status. You can manage a pending request or remove an existing supervisor from the profile.",
      "The employer responds to the request through notifications. Under Evaluations in your student menu, you can evaluate your accepted supervisor more than once during an ongoing internship and review each submission in Past Evaluations.",
    ];
  } else if (page === "user-profile" && searchedRole === "employer") {
    title = "How to review this employer";
    steps = [
      "Review the employer's contact and company details in Info.",
      "Supervised interns appears in a separate card below the employer details when ongoing or completed placements exist. It shows five students per page, with one card per student listing their course and all ongoing and completed positions, companies and internship dates under that supervisor. Use Previous and Next to browse.",
      "Select View profile to open a current or former intern's profile. This history is visible to every signed-in role; it does not grant access to private attendance, narratives, evaluations or documents.",
    ];
  } else if (page === "user-profile" && searchedRole === "student" && hasOngoingInternship && role === "employer" && supervisionStatus === "accepted") {
    title = "How to manage your intern";
    steps = [
      "Use the permitted DTR, weekly narratives, evaluations, certificates, and profile tabs to review your accepted intern.",
      "In DTR, review attendance and use Set DTR Location to save the workplace pin and permitted radius.",
      "In Evaluations, complete the student's performance evaluation after the internship start date in Philippine time. Submit posts it immediately. You can submit multiple progress evaluations for the same ongoing internship; students cannot view them.",
      "Preview, print, or download each performance evaluation with the PDF control. Deleting one hides only that entry from you, while authorized staff retain a Deleted copy. Earlier reviews do not block a new evaluation.",
      "In Certificates, upload the permitted supporting files. PDFs, DOCX, spreadsheets, text, and supported images open in a preview with an original download option. You can delete your own pending uploads.",
    ];
  } else if (page === "user-profile" && searchedRole === "student" && hasOngoingInternship && role === "admin") {
    title = "How to review this student";
    steps = [
      "Use the permitted profile tabs to review the student's attendance, weekly narratives, evaluations, and details.",
      "In DTR, review time records and set or update the attendance pin and radius when needed.",
      "The internship record provides the full record review, including confidential performance evaluations and Deleted evaluation history for authorized staff.",
    ];
  } else if (page === "user-profile") {
    title = "How to use this profile";
    steps = [
      "Review the profile details and tabs available to your role.",
      "Use Search Users to return to the directory or revisit this profile in your recently viewed list.",
      "Only the student's own department head can view Company rotations in this profile's Info tab. View rotations opens the read-only timeline; students manage assignments in My Records. Administrators, employers, students, and other department heads do not see the profile rotation panel.",
      "Confidential internship information is available only to authorized users; viewing a profile does not grant additional access.",
    ];
  } else return null;

  return (
    <ManualDialog title={title} onBrand={onBrand}>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-foreground marker:font-semibold marker:text-primary-emphasis">
        {steps.map(step => <li key={step}>{step}</li>)}
      </ol>
    </ManualDialog>
  );
}

export default PageManual;
