import { Activity, Layers3, ScrollText, Users } from "lucide-react";
import { toSentenceCase, toTitleCase } from "./activityLogFormatting";

export default function ActivityLogsSummary({ total, stats }) {
  return (
    <section aria-label="Activity summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{
        label: "Total events",
        value: total.toLocaleString(),
        detail: "Matching activity logs",
        Icon: Activity
      }, {
        label: "Active users",
        value: Number(stats?.activeUsers || 0).toLocaleString(),
        detail: "Unique users in these logs",
        Icon: Users
      }, {
        label: "Most common action",
        value: toSentenceCase(stats?.mostCommonAction?.name) || "None",
        detail: stats?.mostCommonAction ? `${Number(stats.mostCommonAction.count).toLocaleString()} events` : "No matching activity",
        Icon: ScrollText
      }, {
        label: "Most active module",
        value: toTitleCase(stats?.mostActiveModule?.name) || "None",
        detail: stats?.mostActiveModule ? `${Number(stats.mostActiveModule.count).toLocaleString()} events` : "No matching activity",
        Icon: Layers3
      }].map(({ label, value, detail, Icon }) => (
        <div key={label} className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 text-sm text-foreground-soft">
            <Icon className="size-4 text-primary-emphasis" aria-hidden="true" />
            <span>{label}</span>
          </div>
          <p className="mt-3 truncate text-xl font-semibold text-foreground" title={String(value)}>{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      ))}
    </section>
  );
}
