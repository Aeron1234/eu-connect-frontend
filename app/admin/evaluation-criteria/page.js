import EvaluationCriteriaPageContent from "@/components/evaluations-ui/EvaluationCriteriaPageContent";
import PageTitle from "@/components/ui/PageTitle";
import { getAllEvaluationCriteria } from "@/lib/server-actions/evaluations-actions";
import { SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Evaluation Criteria",
};

async function EvaluationCriteriaPage() {
  const criteria = await getAllEvaluationCriteria({ type: "student" });

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <PageTitle
        Icon={SlidersHorizontal}
        title={"Evaluation Criteria"}
        description={
          "Create, update, and remove the criteria used in student performance and employer evaluations."
        }
      />

      <EvaluationCriteriaPageContent initialCriteria={criteria || []} />
    </main>
  );
}

export default EvaluationCriteriaPage;
