"use client";

import { format } from "date-fns";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import WeeklyNarrativeEditForm from "./WeeklyNarrativeEditForm";
import WeeklyNarrativeDelete from "./WeeklyNarrativeDelete";
import NarrativePreview from "./NarrativePreview";

function WeeklyNarrativeCard({ narrative, showActions = false, onUpdate, onDelete }) {
  return (
    <li className="relative pl-10 sm:pl-14">
      <div className="absolute left-0 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-md ring-4 ring-canvas sm:left-1 sm:h-8 sm:w-8 sm:text-xs">
        {narrative.week_number}
      </div>
      <article className="relative rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className={showActions ? "min-w-0 pr-16 sm:pr-20" : "min-w-0"}>
          <h2 className="text-sm font-semibold text-foreground sm:text-base">
            {narrative.title}
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />{" "}
            {format(new Date(narrative.created_at), "MMMM d, yyyy")} · Week {narrative.week_number}
          </p>
        </div>
        {showActions && (
          <div className="absolute right-3 top-3 flex items-center gap-1 sm:right-4 sm:top-4">
            <Modal variant="form"
              title="Update your narrative"
              trigger={
                <div aria-label="Edit" className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  <Edit2 className="h-4 w-4" />
                </div>
              }
            >
              <WeeklyNarrativeEditForm narrative={narrative} onSuccess={onUpdate} />
            </Modal>
            <Modal variant="confirmation"
              title={<span className="text-red-600">Delete Narrative</span>}
              trigger={
                <div aria-label="Delete" className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </div>
              }
            >
              <WeeklyNarrativeDelete narrativeId={narrative.id} onSuccess={onDelete} />
            </Modal>
          </div>
        )}
        <NarrativePreview narrative={narrative} />
      </article>
    </li>
  );
}

export default WeeklyNarrativeCard;
