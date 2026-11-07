import DepartmentRecordTaskPage from "@/components/internship-records-ui/DepartmentRecordTaskPage";
import { withReadErrorPage } from "@/lib/page-read-error";

export const metadata = { title: "Student Submissions" };
export const dynamic = "force-dynamic";

async function SubmissionRecordPage({ params, searchParams }) {
  const { internshipId } = await params;
  const query = await searchParams;
  const tab = ["narratives", "summary-report", "documents"].includes(query?.tab) ? query.tab : "narratives";
  return await DepartmentRecordTaskPage({ internshipId: decodeURIComponent(internshipId), mode: "submissions", initialTab: tab });
}

export default withReadErrorPage(SubmissionRecordPage);
