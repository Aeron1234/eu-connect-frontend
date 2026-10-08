// app/_components/RecentActivityCard.js
import { Sparkles } from "lucide-react";

function RecentActivityCard({ activities = [], title = "Recent Activity" }) {
  return (
    <div className="h-full rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <Sparkles className="w-4 h-4 text-primary-emphasis" />
        {title}
      </h3>

      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No recent activity yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {activities.map((a, i) => (
            <li
              key={i}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <a.icon className={`w-4 h-4 mt-0.5 ${a.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground line-clamp-2 sm:text-sm">
                  {a.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivityCard;
