function DailyNarrativesStats({ narrativeStats = {} }) {
  return (
    <>
      <div className="rounded-xl bg-primary-500 text-white p-4">
        <p className="text-[11px] uppercase tracking-wide text-white/70">
          Total Entries
        </p>
        <p className="text-2xl font-bold mt-1">
          {narrativeStats?.totalEntries || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border p-4">
        <p className="text-[11px] uppercase tracking-wide text-stone-600">
          Latest Day
        </p>
        <p className="text-2xl font-bold mt-1 text-stone-800">
          Day {narrativeStats?.latestDay || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border p-4">
        <p className="text-[11px] uppercase tracking-wide text-stone-600">
          Total Words
        </p>
        <p className="text-2xl font-bold mt-1 text-stone-800">
          {narrativeStats?.totalWords || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border p-4">
        <p className="text-[11px] uppercase tracking-wide text-stone-600">
          This Week
        </p>
        <p className="text-2xl font-bold mt-1 text-stone-800">
          {narrativeStats?.thisWeek || 0}
        </p>
      </div>
    </>
  );
}

export default DailyNarrativesStats;
