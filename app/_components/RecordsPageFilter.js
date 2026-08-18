import Link from "next/link";

const tabs = [
  { value: "all", label: "All Records" },
  { value: "pending", label: "Pending Approval" },
  { value: "ongoing", label: "Ongoing" },
  { value: "finished", label: "Finished" },
  { value: "rejected", label: "Rejected" },
];

function RecordsPageFilter({ filter, stats = {}, totalItems = 0 }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-background p-1.5">
      {tabs.map((t) => (
        <Link
          key={t.value}
          href={`/internship-records?filter=${t.value}`}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            filter === t.value
              ? "bg-primary-500 text-primary-foreground"
              : "text-foreground/70 hover:text-primary-500"
          }`}
        >
          {t.label}
          <span className="ml-1.5 text-xs opacity-70">
            {t.value === "all" ? totalItems || null : stats[t.value] || null}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default RecordsPageFilter;
