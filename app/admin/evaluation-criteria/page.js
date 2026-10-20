import EvaluationCriteriaPageContent from "@/components/evaluations-ui/EvaluationCriteriaPageContent";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";
import { SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Evaluation Criteria",
};

function EvaluationCriteriaPage() {
  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <PageTitle
        Icon={SlidersHorizontal}
        title={"Evaluation Criteria"}
        description={
          "Create, update, and remove the criteria used in student performance and employer evaluations."
        }
        titleAction={<PageManual page="admin-evaluation-criteria" />}
      />

      <EvaluationCriteriaPageContent />
    </div>
  );
}

export default EvaluationCriteriaPage;
