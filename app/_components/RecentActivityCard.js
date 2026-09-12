// app/_components/RecentActivityCard.js
import { Sparkles } from "lucide-react";

function RecentActivityCard({ activities = [], title = "Recent Activity" }) {
  return (
    <div className="h-full rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-4">
        <Sparkles className="w-4 h-4 text-primary-500" />
        {title}
      </h3>

      {activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No recent activity yet.
        </p>
      ) : (
        <ul className="divide-y divide-stone-300">
          {activities.map((a, i) => (
            <li
              key={i}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <a.icon className={`w-4 h-4 mt-0.5 ${a.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-stone-800 line-clamp-2">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentActivityCard;
