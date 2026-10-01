function DailyNarrativesStats({ narrativeStats = {} }) {
  return (
    <>
      <div className="rounded-xl bg-primary text-white p-4">
        <p className="text-[11px] uppercase tracking-wide text-white/70">
          Total Entries
        </p>
        <p className="text-2xl font-bold mt-1">
          {narrativeStats?.totalEntries || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border p-4">
        <p className="text-[11px] uppercase tracking-wide text-foreground-soft">
          Latest Day
        </p>
        <p className="text-2xl font-bold mt-1 text-foreground">
          Day {narrativeStats?.latestDay || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border p-4">
        <p className="text-[11px] uppercase tracking-wide text-foreground-soft">
          Total Words
        </p>
        <p className="text-2xl font-bold mt-1 text-foreground">
          {narrativeStats?.totalWords || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border p-4">
        <p className="text-[11px] uppercase tracking-wide text-foreground-soft">
          This Week
        </p>
        <p className="text-2xl font-bold mt-1 text-foreground">
          {narrativeStats?.thisWeek || 0}
        </p>
      </div>
    </>
  );
}

export default DailyNarrativesStats;
