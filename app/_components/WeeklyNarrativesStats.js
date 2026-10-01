function WeeklyNarrativesStats({ narrativeStats = {} }) {
  return (
    <>
      <div className="rounded-xl bg-primary text-white p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-white/70">
          Total Entries
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1">
          {narrativeStats?.totalEntries || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border border-border shadow-sm p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground">
          Latest Week
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-foreground">
          Week {narrativeStats?.latestWeek || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border border-border shadow-sm p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground">
          Total Words
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-foreground">
          {narrativeStats?.totalWords || 0}
        </p>
      </div>
      <div className="rounded-xl bg-card border border-border shadow-sm p-3 sm:p-4">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground">
          This Week
        </p>
        <p className="text-xl sm:text-2xl font-bold mt-1 text-foreground">
          {narrativeStats?.thisWeek || 0}
        </p>
      </div>
    </>
  );
}

export default WeeklyNarrativesStats;
