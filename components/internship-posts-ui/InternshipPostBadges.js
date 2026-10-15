import { Check, Users } from "lucide-react";

const workTypeStyles = {
  "on-site": "border-sky-200 bg-sky-50 text-sky-700",
  hybrid: "border-violet-200 bg-violet-50 text-violet-700",
  remote: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function InternshipPostBadges({ item, userRole, isFavorited, toggleFavorite }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <span
        className={`rounded-full border px-3 py-1 text-xs font-medium ${workTypeStyles[item.work_type]}`}
      >
        {item.work_type}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-foreground-soft">
        <Users className="h-4 w-4 text-foreground-subtle" /> {item.vacancies}{" "}
        vacancies
      </span>

      {!item.isOwner && userRole === "student" && (
        <button
          type="button"
          onClick={toggleFavorite}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            isFavorited
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-primary text-white hover:bg-primary-600"
          }`}
        >
          {isFavorited && <Check className="h-3.5 w-3.5" />}
          {isFavorited ? "Favorite" : "Mark as Favorite"}
        </button>
      )}
    </div>
  );
}
