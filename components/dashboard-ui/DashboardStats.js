import Link from "next/link";

// Shared responsive layout: one column below sm, two from sm, then three/four
// from lg according to card count. Keep DashboardStatsSkeleton aligned.
function DashboardStats({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <section className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} lg:gap-4`}>
      {stats.map((s) => {
        const Card = s.href ? Link : "div";
        return (
          <Card key={s.label} href={s.href} className={`min-w-0 rounded-xl p-4 ${s.accent} shadow-sm ${s.href ? "transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" : ""}`}>
            <div className="flex items-center gap-2">
              <s.icon className="size-4 shrink-0 opacity-90" aria-hidden="true" />
              <p className={`text-sm font-medium ${s.labelClass}`}>{s.label}</p>
            </div>
            <p className={`${s.small ? "text-xl" : "text-3xl"} mt-3 break-words font-bold ${s.valueClass}`}>
              {s.value}
            </p>
            {s.detail && <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>}
          </Card>
        );
      })}
    </section>
  );
}

export default DashboardStats;
