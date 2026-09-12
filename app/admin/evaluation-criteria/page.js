import EvaluationCriteriaPageContent from "@/app/_components/EvaluationCriteriaPageContent";
import PageTitle from "@/app/_components/PageTitle";
import { getAllEvaluationCriteria } from "@/app/_services/admin-actions";
import { SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Evaluation Criteria",
};

async function EvaluationCriteriaPage({ searchParams }) {
  const sParams = await searchParams;

  const formType = sParams.form_type || "student";
  const filter = sParams.filter || "all";

  const criteria = await getAllEvaluationCriteria({ type: formType });

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-4">
      <PageTitle
        Icon={SlidersHorizontal}
        title={"Evaluation Criteria"}
        description={
          "Create, update, and remove the criteria used in student performance and employer evaluations."
        }
      />

      <EvaluationCriteriaPageContent
        criteria={criteria || []}
        formType={formType}
        filter={filter}
      />
    </main>
  );
}

export default EvaluationCriteriaPage;
