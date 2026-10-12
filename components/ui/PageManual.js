"use client";

import { useUser } from "@/contexts/UserContext";
import ManualDialog from "./ManualDialog";

function PageManual({ page, searchedRole, hasOngoingInternship = false, supervisionStatus, onBrand = false }) {
  const { user } = useUser();
  const role = user?.role;
  let title;
  let steps;

  if (page === "admin-error-tracking" && role === "admin") {
    title = "How error tracking works";
    steps = [
      <>The backend records unexpected HTTP failures and reported background-job errors. Similar failures are grouped together, so <strong>groups</strong> counts distinct problems while <strong>occurrences</strong> counts how many times they happened.</>,
      <>Search for a route, error code, or message. Narrow the results by date range, HTTP method, source, or status code, then use the page controls to browse older groups.</>,
      <>Select a group to see up to 25 recent occurrences. Check the time, route and method, message, code location, and request ID to trace a failure. Background jobs show a source instead of an HTTP route.</>,
      <>Select <strong>Refresh</strong> to check for newer errors. This page is read-only and keeps events for 30 days. A fatal process crash may appear only in hosting logs if the database write could not finish during shutdown.</>,
    ];
  } else if (page === "admin-cache-monitoring" && role === "admin") {
    title = "How cache monitoring works";
    steps = [
      <>This page measures the <strong>backend response cache</strong> for one running server process. It does not measure the browser&apos;s TanStack Query cache or database query time.</>,
      <>A <strong>hit</strong> reuses a stored response. A <strong>miss</strong> means the backend had no usable cached response and fetched it again. Both can occur in the same period: a miss may populate the cache, and later requests can hit it. Hit rate is hits divided by hits plus misses.</>,
      <>Select <strong>Refresh</strong> to compare activity since the previous snapshot, or turn on <strong>Auto-refresh</strong> for updates every 30 seconds. Before a second snapshot, counts are shown since the backend process started; they reset after a restart.</>,
      <>Search or sort <strong>Routes using the cache</strong> to find endpoints with many misses or bypasses. A bypass skips lookup; a skipped store means a response was not suitable to save. Cache turnover shows stores, invalidations, expirations, and flushes.</>,
      <>Stored entries show cache capacity. The memory figures are estimates, and process heap includes the entire backend. Requests rejected before the cache middleware are not included.</>,
    ];
  } else if (page === "admin-accounts" && role === "admin") {
    title = "How to manage accounts";
    steps = [
      <>Open the <strong>Form</strong> tab, enter the person&apos;s details and a temporary password, then choose their role. Student and department-head roles have additional course or department fields.</>,
      <>Select <strong>Create Account</strong> to save it. Use the <strong>Accounts</strong> tab to search by name or email and filter by role.</>,
      <>Find an account in the list and choose its deactivate control when it should no longer be able to sign in. Review and confirm the action in the dialog.</>,
    ];
  } else if (page === "admin-departments" && role === "admin") {
    title = "How to manage departments and courses";
    steps = [
      <>Use the two forms to add a <strong>department</strong> or a <strong>course</strong>. Choose the course&apos;s department before saving it.</>,
      <>Switch between <strong>Departments</strong> and <strong>Courses</strong>. Search by name or code, and use the status filters to find active or inactive entries.</>,
      <>Select <strong>Edit</strong> to correct a name, code, or course department. Use <strong>Deactivate</strong> or <strong>Activate</strong> to change availability; confirm department deactivation in the dialog.</>,
    ];
  } else if (page === "admin-activity-logs" && role === "admin") {
    title = "How to manage activity logs";
    steps = [
      <>Review the summary cards to see activity counts. Search descriptions or filter by <strong>Role</strong> and <strong>Module</strong> to narrow the log.</>,
      <>Read each entry for its action, actor, time, and related details. Select <strong>View submitted details</strong> when an entry offers more information.</>,
      <>Select the trash icon on a log entry only when it needs to be removed, then confirm the deletion.</>,
    ];
  } else if (page === "admin-evaluation-criteria" && role === "admin") {
    title = "How to manage evaluation criteria";
    steps = [
      <>Switch between the <strong>Student</strong> and <strong>Employer</strong> evaluation forms, then use the status filters to see active or inactive criteria.</>,
      <>Enter a section title and select <strong>Add Section</strong>. A section is saved after you add its first criterion. Use <strong>Add criterion</strong> within a section to add another item.</>,
      <>Use the controls beside a criterion or section to deactivate or reactivate it. Confirm deactivation in the dialog; inactive criteria are unavailable for new evaluations.</>,
    ];
  } else if (page === "announcements" && ["admin", "department_head"].includes(role)) {
    title = "How to manage announcements";
    steps = [
      <>Select <strong>Announce</strong>, enter the announcement details and event date if needed, then post it.</>,
      <>Use search and the category filter to find an announcement. Select <strong>See more</strong> to read long posts.</>,
      <>Use the controls on an announcement you can manage to edit, pin or unpin, or delete it. Confirm deletion in the dialog.</>,
    ];
  } else if (page === "internships" && role === "employer") {
    title = "How to manage internship posts";
    steps = [
      <>Select <strong>Post Job</strong>, fill in the internship details and requirements, then submit the post.</>,
      <>Use search and filters to find posts. Select <strong>My Posts</strong> to see the opportunities you created.</>,
      <>On your own post, use the edit or delete control to update or remove it.</>,
    ];
  } else if (page === "internships" && role === "student") {
    title = "How to save internship posts";
    steps = [
      <>Use search and the work type or course filters to find relevant opportunities.</>,
      <>Select <strong>Mark as Favorite</strong> on a post you want to keep. Select it again to remove the favorite.</>,
      <>Use the favorite filter to return to posts you saved.</>,
    ];
  } else if (page === "users") {
    title = "How to search users";
    steps = [
      <>Enter at least three characters in the search box to find people by name.</>,
      <>Select a result to open that person&apos;s profile. Your recently viewed profiles appear here when the search box is empty.</>,
      <>Remove one profile from your history with its X control, or select <strong>clear all</strong> to empty the list.</>,
      ...(role === "student" ? [<>For an employer, use <strong>Set as Supervisor</strong> when available. You can also manage the request or remove an existing supervisor from their profile.</>] : []),
    ];
  } else if (page === "user-profile" && role === "student" && searchedRole === "employer") {
    title = "How to manage your supervisor";
    steps = [
      <>Review the employer&apos;s profile and select <strong>Set as Supervisor</strong> if you want to request supervision.</>,
      <>Check the button for the request status. If the employer is already your supervisor, you can remove them there.</>,
    ];
  } else if (page === "user-profile" && searchedRole === "student" && hasOngoingInternship && role === "employer" && supervisionStatus === "accepted") {
    title = "How to manage your intern";
    steps = [
      <>Use the tabs to review the student&apos;s DTR, weekly narratives, evaluations, certificates, and profile information.</>,
      <>In <strong>DTR</strong>, set the student&apos;s clock-in location if needed. In <strong>Evaluations</strong>, complete the supervisor evaluation.</>,
      <>In <strong>Certificates</strong>, upload or manage the student&apos;s completion certificates.</>,
    ];
  } else if (page === "user-profile" && searchedRole === "student" && hasOngoingInternship && role === "admin") {
    title = "How to review this student";
    steps = [
      <>Use the tabs to review the student&apos;s DTR, weekly narratives, evaluations, and profile information.</>,
      <>In <strong>DTR</strong>, review the attendance records and set or update the student&apos;s clock-in location when needed.</>,
    ];
  } else {
    return null;
  }

  return (
    <ManualDialog title={title} onBrand={onBrand}>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-foreground marker:font-semibold marker:text-primary-emphasis">
        {steps.map((step, index) => <li key={index}>{step}</li>)}
      </ol>
    </ManualDialog>
  );
}

export default PageManual;
