function WeeklyNarrativesStats({ narrativeStats = {} }) {
  return (
    <>
      <div className="rounded-xl bg-primary-500 text-white p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-white/70">
          Total Entries
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1">
          {narrativeStats?.totalEntries || 0}
        </p>
      </div>
      <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-stone-500">
          Latest Week
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-stone-800">
          Week {narrativeStats?.latestWeek || 0}
        </p>
      </div>
      <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-stone-500">
          Total Words
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-stone-800">
          {narrativeStats?.totalWords || 0}
        </p>
      </div>
      <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-stone-500">
          This Week
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-stone-800">
          {narrativeStats?.thisWeek || 0}
        </p>
      </div>
    </>
  );
}

export default WeeklyNarrativesStats;
