"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function StudentEvaluationsHelp() {
  return (
    <ManualDialog title="How to use evaluations">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Use the tabs to evaluate your supervisor and review the evaluations you submitted.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>In <strong>Evaluate Supervisor</strong>, review the 0–5 grade scale, choose a score for each criterion, add optional remarks, and select <strong>Submit Evaluation</strong>.</li>
          <li>In <strong>Past Evaluations</strong>, review the feedback you submitted about your supervisor. You may have one active evaluation per internship. Delete it to post a replacement; staff retain deleted copies for review.</li>
        </ol>
        <p className="text-foreground-soft">Your employer&apos;s performance evaluation is confidential and is sent directly to your department head.</p>
      </div>
    </ManualDialog>
  );
}
