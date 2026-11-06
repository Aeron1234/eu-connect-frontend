import { notFound, redirect } from "next/navigation";
import EvaluationCriteriaPageContent from "@/components/evaluations-ui/EvaluationCriteriaPageContent";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import { getUserSession } from "@/lib/server-actions/auth";
import { SlidersHorizontal } from "lucide-react";

export const metadata = { title: "Evaluation Criteria" };

export default async function EvaluationCriteriaPage() {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "department_head" || session.user.department_code === "REG") notFound();

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle
        Icon={SlidersHorizontal}
        title="Evaluation Criteria"
        description="Manage the evaluation questions used by students in your department and their supervisors."
        titleAction={<PageManual page="department-head-evaluation-criteria" />}
      />
      <EvaluationCriteriaPageContent />
    </div>
  );
}
