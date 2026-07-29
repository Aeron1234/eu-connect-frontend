"use client";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleX,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
// import DtrDeleteForm from "./DtrDeleteForm";
import Modal from "./Modal";
import StudentEvaluationDeleteForm from "./StudentEvaluationDeleteForm";

function StudentEvaluationItem({ ev, defaultOpen, userId }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const total = ev.breakdown.reduce((a, b) => a + b.score, 0);
  const totalMax = ev.breakdown.reduce((a, b) => a + b.max, 0);

  console.log("StudentEvaluationItem ev:", ev);

  const statusClass = (status) =>
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700";

  return (
    <div
      className={`border border-stone-300 rounded-xl bg-white overflow-hidden mb-3 ${ev.status === "Pending" ? "opacity-70" : ""}`}
    >
      <div className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
        <button
          onClick={() => setOpen((o) => !o)}
          className="contents text-left"
          aria-label={open ? "Collapse evaluation" : "Expand evaluation"}
        >
          <CircularScore score={total} max={totalMax} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {ev.type}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass(ev.status)}`}
              >
                {ev.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {ev.period}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {ev.evaluator}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Submitted {ev.submittedDate}
              </span>
            </div>
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>
        {ev.status === "Pending" && userId === ev.evaluator_id && (
          <Modal
            trigger={
              <div
                className="shrink-0 p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete evaluation"
                title="Delete evaluation"
              >
                <Trash2 className="w-4 h-4" />
              </div>
            }
            title={
              <span className={`text-primary-500`}>Delete Evaluation</span>
            }
            // title={<span className="text-red-600">Clock-out?</span>}
            description={`Are you sure you want to delete this evaluation?`}
          >
            <StudentEvaluationDeleteForm
              evaluationId={ev.id}
              status={ev.status === "Pending"}
            />
          </Modal>
        )}
      </div>

      {open && (
        <div className="border-t border-stone-200 px-4 sm:px-5 py-4 space-y-4 bg-stone-50/50">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Score Breakdown
            </p>
            <div className="space-y-3">
              {ev.breakdown.map((b) => {
                const pct = Math.max(0, Math.min(100, (b.score / b.max) * 100));
                return (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-stone-700">{b.label}</span>
                      <span className="text-xs font-medium text-stone-500">
                        {b.score}/{b.max}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {ev.comments && (
            <div className="rounded-lg bg-white border border-stone-200 p-4 ">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-stone-800">
                <Star className="w-4 h-4 text-primary-500" />
                Supervisor Comments
              </div>
              <p className="text-sm text-stone-600 italic leading-relaxed">
                &quot;{ev.comments}&quot;
              </p>
              <p className="text-xs text-stone-400 mt-2">
                — {ev.evaluator}, {ev.company}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CircularScore = ({ score, max }) => {
  const pct = Math.max(0, Math.min(1, score / max));
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          strokeWidth="5"
          className="stroke-stone-200 fill-none dark:stroke-stone-700"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-primary-500 fill-none transition-all"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-bold text-stone-800">{score}</span>
        <span className="text-[10px] text-stone-400">/{max}</span>
      </div>
    </div>
  );
};

export default StudentEvaluationItem;
