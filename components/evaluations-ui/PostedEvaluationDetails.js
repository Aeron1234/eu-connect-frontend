"use client";

import { Star, MessageSquareQuote } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";

export default function PostedEvaluationDetails({ ev }) { return (
    <div className="border-t border-border px-4 sm:px-5 py-4 space-y-4 bg-muted/50">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle mb-3">
          Score Breakdown
        </p>
        <div className="space-y-3">
          {ev.breakdown.map((b) => {
            const pct = Math.max(0, Math.min(100, (b.score / b.max) * 100));
            return (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{b.label}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {b.score}/{b.max}
                  </span>
                </div>
                <ProgressBar value={pct} label={`${b.label} score`} />
              </div>
            );
          })}
        </div>
      </div>

      {ev.comments && (
        <div className="rounded-lg bg-card border border-border p-4 ">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
            <Star className="w-4 h-4 text-primary-emphasis" />
            Supervisor Comments
          </div>
          <p className="text-sm text-foreground-soft italic leading-relaxed">
            &quot;{ev.comments}&quot;
          </p>
          <p className="text-xs text-foreground-subtle mt-2">
            — {ev.evaluator}, {ev.company}
          </p>
        </div>
      )}

      {ev.status === "Disputed" && ev?.review_notes && (
        <div className="rounded-lg bg-card border border-border p-4 ">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
            <MessageSquareQuote className="w-4 h-4 text-primary-emphasis" />
            Review notes
          </div>
          <p className="text-sm text-foreground-soft italic leading-relaxed">
            &quot;{ev?.review_notes}&quot;
          </p>
          <p className="text-xs text-foreground-subtle mt-2">
            — {ev?.reviewer_name}
          </p>
        </div>
      )}
    </div>
  ); }
