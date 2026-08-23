import EvaluationCriteriaPageContent from "@/app/_components/EvaluationCriteriaPageContent";
import { SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "Evaluation Criteria",
};

async function EvaluationCriteriaPage({ searchParams }) {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
          <SlidersHorizontal className="w-7 h-7 text-primary-500" />
          Evaluation Criteria
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Create, update, and remove the criteria used in student performance
          and employer evaluations.
        </p>
      </div>

      <EvaluationCriteriaPageContent />
    </main>
  );
}

export default EvaluationCriteriaPage;
