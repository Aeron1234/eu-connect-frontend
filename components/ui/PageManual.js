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
  "admin-evaluation-criteria": "evaluation-criteria",
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
      "Check the button for the request status. You can manage a pending request or remove an existing supervisor from the profile.",
      "The employer responds to the request through notifications. Your submitted supervisor evaluations are under Evaluations in your student menu.",
    ];
  } else if (page === "user-profile" && searchedRole === "student" && hasOngoingInternship && role === "employer" && supervisionStatus === "accepted") {
    title = "How to manage your intern";
    steps = [
      "Use the permitted DTR, weekly narratives, evaluations, certificates, and profile tabs to review your accepted intern.",
      "In DTR, review attendance and use Set DTR Location to save the workplace pin and permitted radius.",
      "In Evaluations, complete the student's performance evaluation after the internship start date in Philippine time. Submit posts it immediately. Only one active evaluation is allowed per internship, and students cannot view it.",
      "Preview, print, or download a performance evaluation with the PDF control. Deleting your evaluation hides it from you and allows a replacement, while authorized staff retain a Deleted copy.",
      "In Certificates, upload the permitted supporting files. PDFs open in the preview; other formats open in a browser tab and may download. You can delete your own pending uploads.",
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
