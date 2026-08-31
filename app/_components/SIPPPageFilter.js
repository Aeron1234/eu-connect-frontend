import Link from "next/link";
const scopeTabs = [
  { label: "Annex C — Annual Reports", value: "annex-c" },
  { label: "Annex D — HTE and Intern List", value: "annex-d" },
];

function SIPPPageFilter({ filter }) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-3">
      <div className="flex rounded-lg bg-stone-200 p-1">
        {scopeTabs.map((s) => (
          <Link
            key={s.value}
            href={`/department_head/sipp-reports?filter=${s.value}`}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              filter === s.value
                ? "bg-primary-500 text-primary-foreground"
                : "bg-stone-200 text-muted-foreground hover:text-primary-500"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SIPPPageFilter;
