import { format } from "date-fns";
import { Calendar } from "lucide-react";
import NarrativePreview from "./NarrativePreview";

function RecordsNarrative({ narrative }) {
  return (
    <li>
      <article className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              {narrative.title}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Calendar className="w-3.5 h-3.5" />{" "}
              {format(new Date(narrative.created_at), "MMMM d, yyyy")} · Week{" "}
              {narrative.week_number}
            </p>
          </div>
        </div>
        <NarrativePreview narrative={narrative} />
      </article>
    </li>
  );
}

export default RecordsNarrative;
