function DashboardStats({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <section className={`grid gap-2 grid-cols-2 ${stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} lg:gap-4`}>
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl p-4 ${s.accent} shadow-sm`}>
          <div className="flex lg:items-center gap-2 flex-col sm:flex-row ">
            <s.icon className="w-4 h-4 opacity-90" />
            <p className={`text-sm font-medium ${s.labelClass}`}>{s.label}</p>
          </div>
          <p
            className={`${s.small ? "text-xl" : "text-3xl"} font-bold mt-3 ${s.valueClass}`}
          >
            {s.value}
          </p>
        </div>
      ))}
    </section>
  );
}

export default DashboardStats;
