import EvaluationCard from "./EvaluationCard";

function StudentEvaluationList({ pastEvaluations = [] }) {
  return (
    <div>
      <h3 className="font-semibold text-base mb-4 text-stone-800 ">
        Past Evaluations
      </h3>
      {/* Fixed: Looks up by studentId prop instead of undefined variable 's' */}
      <EvaluationCard evaluations={pastEvaluations ?? []} />
    </div>
  );
}

export default StudentEvaluationList;
