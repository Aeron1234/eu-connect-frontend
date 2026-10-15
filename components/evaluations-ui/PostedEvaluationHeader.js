"use client";

import { Calendar, ChevronDown, ChevronUp, Trash2, User } from "lucide-react";
import Modal from "../ui/Modal";
import StudentEvaluationDeleteForm from "./StudentEvaluationDeleteForm";
import CircularScore from "./EvaluationCircularScore";
import { evaluationStatusClass as statusClass } from "./evaluationStatusClass";

export default function PostedEvaluationHeader({ ev, open, setOpen, total, totalMax, userId, onChanged }) { return (
    <div className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      <button
        onClick={() => setOpen((o) => !o)}
        className="contents text-left"
        aria-label={open ? "Collapse evaluation" : "Expand evaluation"}
      >
        <CircularScore score={total} max={totalMax} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-emphasis">
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
        <Modal variant="confirmation"
          trigger={
            <div
              className="shrink-0 p-2 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Delete evaluation"
              title="Delete evaluation"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          }
          title={
            <span className={`text-primary-emphasis`}>Delete Evaluation</span>
          }
        >
          <StudentEvaluationDeleteForm
            evaluationId={ev.id}
            status={ev.status === "Pending"}
            onSuccess={onChanged}
          />
        </Modal>
      )}
    </div>
  ); }
