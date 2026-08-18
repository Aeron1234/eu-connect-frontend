import { notFound } from "next/navigation";
import EmployerEvaluations from "./EmployerEvaluations";
import {
  getAllEvaluations,
  getDisputedEvaluations,
  getEmployerEvaluationCriterias,
  getStudentPendingEvaluations,
} from "../_services/services";
import EvaluationCard from "./EvaluationCard";

function EvaluationPageContent({ filter }) {
  switch (filter) {
    case "evaluate-supervisor":
      return <EvaluateSuperVisorTab />;
    case "pending-confirmation":
      return <PendingEvaluationsTab />;
    case "past-evaluations":
      return <PastEvaluationsTab />;
    case "disputed":
      return <DisputedTab />;
    default:
      notFound();
  }
}

async function EvaluateSuperVisorTab() {
  const employerEvaluationCriterias = await getEmployerEvaluationCriterias();

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6 mb-8">
      <EmployerEvaluations
        employerEvaluationCriterias={employerEvaluationCriterias}
      />
    </div>
  );
}

async function PendingEvaluationsTab() {
  const evaluationData = await getStudentPendingEvaluations();

  return (
    <EvaluationCard
      evaluations={evaluationData?.data || []}
      type={"confirmation"}
    />
  );
}

async function PastEvaluationsTab() {
  const evaluationData = await getAllEvaluations();

  return (
    <EvaluationCard evaluations={evaluationData?.data || []} type={"all"} />
  );
}

async function DisputedTab() {
  const evaluationData = await getDisputedEvaluations();
  return (
    <EvaluationCard
      evaluations={evaluationData?.data || []}
      type={"disputed"}
    />
  );
}
export default EvaluationPageContent;
