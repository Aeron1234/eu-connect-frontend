import DepartmentRecordTaskPage from "@/components/internship-records-ui/DepartmentRecordTaskPage";
import { withReadErrorPage } from "@/lib/page-read-error";

export const metadata = { title: "Student Evaluations" };
export const dynamic = "force-dynamic";

async function EvaluationRecordPage({ params, searchParams }) {
  const { internshipId } = await params;
  const query = await searchParams;
  return await DepartmentRecordTaskPage({ internshipId: decodeURIComponent(internshipId), mode: "evaluations", evaluationId: typeof query?.evaluationId === "string" ? query.evaluationId : null });
}

export default withReadErrorPage(EvaluationRecordPage);
