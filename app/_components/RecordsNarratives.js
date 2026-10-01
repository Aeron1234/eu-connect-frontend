import { format } from "date-fns";
import { Calendar } from "lucide-react";
import Modal from "./Modal";

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
        <p className="text-sm text-foreground-soft leading-relaxed mt-3 line-clamp-3">
          {narrative.narrative}
        </p>

        <Modal
          title={
            <p className="text-xs text-muted-foreground">
              {format(new Date(narrative.created_at), "MMMM d, yyyy")} · Week{" "}
              {narrative.week_number}
            </p>
          }
          description={
            <span className="text-lg font-bold text-foreground block">
              {narrative.title || "Untitled"}
            </span>
          }
          trigger={
            <div className="text-xs font-semibold text-primary-emphasis hover:underline mt-3 cursor-pointer">
              Read more →
            </div>
          }
        >
          <div className="bg-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {narrative.narrative}
            </p>
          </div>
        </Modal>
      </article>
    </li>
  );
}

export default RecordsNarrative;
