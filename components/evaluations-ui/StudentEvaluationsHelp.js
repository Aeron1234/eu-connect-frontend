"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function StudentEvaluationsHelp() {
  return (
    <ManualDialog title="How to use evaluations">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Use the tabs to evaluate your supervisor and respond to evaluations about your work.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>In <strong>Evaluate Supervisor</strong>, review the 0–5 grade scale, choose a score for each criterion, add optional remarks, and select <strong>Submit Evaluation</strong>.</li>
          <li>In <strong>Pending Confirmation</strong>, open an evaluation from your supervisor to review its scores and comments. Select <strong>Accept &amp; Confirm</strong> if you agree, or <strong>Dispute</strong> if you need it reviewed.</li>
          <li>In <strong>Disputed</strong>, review a disputed evaluation. Use <strong>Restore</strong> if you want to return it to Pending Confirmation.</li>
          <li>In <strong>Past Evaluations</strong>, review earlier results. A confirmed performance evaluation may have an <strong>Export PDF</strong> button.</li>
        </ol>
        <p className="text-foreground-soft">If you submitted an evaluation that is still pending, its trash icon lets you delete it.</p>
      </div>
    </ManualDialog>
  );
}
