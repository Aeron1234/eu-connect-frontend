import EvaluationCard from "./EvaluationCard";

function StudentEvaluationList({ pastEvaluations = [], onChanged }) {
  return <EvaluationCard evaluations={pastEvaluations ?? []} onChanged={onChanged} />;
}

export default StudentEvaluationList;
