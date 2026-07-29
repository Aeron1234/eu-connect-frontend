import StudentEvaluationItem from "./StudentEvaluationItem";

function StudentEvaluationList({ pastEvaluations = [], userId }) {
  return (
    <div>
      <h3 className="font-semibold text-base mb-4 text-stone-800 ">
        Past Evaluations
      </h3>
      {/* Fixed: Looks up by studentId prop instead of undefined variable 's' */}
      <PastEvaluations evaluations={pastEvaluations ?? []} userId={userId} />
    </div>
  );
}

const PastEvaluations = ({ evaluations, userId }) => {
  if (evaluations.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-6">
        No past evaluations yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {evaluations.map((ev, i) => (
        <StudentEvaluationItem
          key={ev.id}
          ev={ev}
          defaultOpen={i === 0}
          userId={userId}
        />
      ))}
    </div>
  );
};

export default StudentEvaluationList;
