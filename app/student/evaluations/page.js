import EvaluationsManager from "@/app/_components/EvaluationsManager";
import PageTitle from "@/app/_components/PageTitle";
import { getEmployerEvaluationCriterias } from "@/lib/server-actions/evaluations-actions";
import { ClipboardCheck } from "lucide-react";

export const metadata = {
  title: "Evaluations",
};

export const dynamic = "force-dynamic";

async function EvaluationsPage() {
  const employerEvaluationCriterias = await getEmployerEvaluationCriterias();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <PageTitle
        Icon={ClipboardCheck}
        title={"Evaluations"}
        description={
          "Rate your supervisor, confirm evaluations submitted about you, and review past records."
        }
      />

      <EvaluationsManager initialCriteria={employerEvaluationCriterias || []} />
    </main>
  );
}

export default EvaluationsPage;
