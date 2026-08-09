const gradeScale = [
  { points: 5, label: "Excellent", equivalent: "95-100" },
  { points: 4, label: "Superior", equivalent: "90-94" },
  { points: 3, label: "Very Good", equivalent: "85-89" },
  { points: 2, label: "Good", equivalent: "80-84" },
  { points: 1, label: "Fair", equivalent: "75-79" },
  { points: 0, label: "Poor", equivalent: "74 below" },
];

function EvaluationsCriteria() {
  return (
    <div className="p-4 w-full bg-stone-100 rounded-lg border border-stone-300 mb-2">
      <p className="mb-4 text-base font-semibold">Numerical Grade Scale</p>

      <div className="grid sm:grid-cols-3 gap-2 lg:grid-cols-6  grid-cols-2">
        {gradeScale.map((gs) => (
          <GradeScaleCard
            key={gs.points}
            points={gs.points}
            label={gs.label}
            equivalent={gs.equivalent}
          />
        ))}
      </div>
    </div>
  );
}

function GradeScaleCard({ points, label, equivalent }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 bg-white border border-stone-300 rounded-lg">
      <span className="text-lg text-primary-500 font-bold">{points}</span>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-stone-500 text-xs font-medium">{equivalent}</span>
    </div>
  );
}

export default EvaluationsCriteria;
