import EvaluationsManager, { StudentEvaluationsHelp } from "@/components/evaluations-ui/EvaluationsManager";
import PageTitle from "@/components/ui/PageTitle";
import { ClipboardCheck } from "lucide-react";

export const metadata = {
  title: "Evaluations",
};

function EvaluationsPage() {
  return (
    <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8">
      <PageTitle
        Icon={ClipboardCheck}
        title="Evaluations"
        description="Rate your supervisor, confirm evaluations submitted about you, and review past records."
        titleAction={<StudentEvaluationsHelp />}
      />

      <EvaluationsManager />
    </main>
  );
}

export default EvaluationsPage;
