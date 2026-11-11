import EvaluationsManager, { StudentEvaluationsHelp } from "@/components/evaluations-ui/EvaluationsManager";
import PageTitle from "@/components/ui/PageTitle";
import { ClipboardCheck } from "lucide-react";

export const metadata = {
  title: "Evaluations",
};

function EvaluationsPage() {
  return (
    <div className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageTitle
        Icon={ClipboardCheck}
        title="Evaluations"
        description="Rate your internship company and review your submitted evaluations."
        titleAction={<StudentEvaluationsHelp />}
      />

      <EvaluationsManager />
    </div>
  );
}

export default EvaluationsPage;
