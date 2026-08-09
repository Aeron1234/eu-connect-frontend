import Link from "next/link";

const tabs = [
  { label: "Evaluate Supervisor", value: "evaluate-supervisor" },
  { label: "Pending Confirmation", value: "pending-confirmation" },
  { label: "Past Evaluations", value: "past-evaluations" },
  { label: "Disputed", value: "disputed" },
];

function EmployerEvaluationsFilter({ filter }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-white shadow-sm p-1.5">
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={`/student/evaluations?filter=${t.value}`}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === t.value
              ? "bg-primary-500 text-primary-foreground"
              : "text-foreground/70 hover:bg-accent"
          }`}
        >
          {t.label}
          {/* {t === "Pending Confirmation" && pending.length > 0 && (
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                tab === t
                  ? "bg-primary-foreground/20"
                  : "bg-maroon/10 text-maroon"
              }`}
            >
              {pending.length}
            </span>
          )} */}
        </Link>
      ))}
    </div>
  );
}

export default EmployerEvaluationsFilter;
