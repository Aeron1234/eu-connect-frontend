"use client";
import ExportPdfButton from '../ui/ExportPdfButton';
export default function PostedEvaluationActions({ ev, canPrint }) {
  if (!canPrint) return null;
  return <div className="flex justify-end border-t border-border bg-card px-5 py-4">
    <ExportPdfButton endpoint="/api/reports/student-evaluation" params={{ evaluationId: ev.id }} label="Export PDF" />
  </div>;
}
