import EvaluationCard from "./EvaluationCard";

function StudentEvaluationList({ pastEvaluations = [] }) {
  return <EvaluationCard evaluations={pastEvaluations ?? []} />;
}

export default StudentEvaluationList;
