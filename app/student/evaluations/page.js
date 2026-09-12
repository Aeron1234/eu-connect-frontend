import EmployerEvaluationsFilter from "@/app/_components/EmployerEvaluationsFilter";
import EvaluationPageContent from "@/app/_components/EvaluationPageContent";
import PageTitle from "@/app/_components/PageTitle";
import { ClipboardCheck } from "lucide-react";

export const metadata = {
  title: "Evaluations",
};

async function EvaluationsPage({ searchParams }) {
  const sParams = await searchParams;

  const filter = sParams.filter || "evaluate-supervisor";

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={ClipboardCheck}
          title={"Evaluations"}
          description={
            "Rate your supervisor, confirm evaluations submitted about you, and review past records."
          }
        />
      </div>

      <EmployerEvaluationsFilter filter={filter} />

      <div className="flex flex-col gap-2 mt-2">
        <EvaluationPageContent filter={filter} />
      </div>
    </main>
  );
}

export default EvaluationsPage;
