"use client";

import { fieldClass } from "./summaryReportFields";
import SummaryReportTextFields from "./SummaryReportTextFields";
import SummaryReportImagePicker from "./SummaryReportImagePicker";
import SummaryReportEditorActions from "./SummaryReportEditorActions";
import useSummaryReportEditor from "./useSummaryReportEditor";

export default function SummaryReportEditor({ record, onSaved, onCancel }) {
  const { values, setValues, error, words, mutation, submit, ...imageProps } = useSummaryReportEditor({ record, onSaved });

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{record.report_id ? "Edit your summary report" : "Write your summary report"}</h2>
        <p className="mt-1 text-sm text-foreground-soft">Write in paragraphs using the outline below. One report is allowed for this internship; you can edit it later.</p>
      </div>
      <SummaryReportTextFields values={values} setValues={setValues} />
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block min-w-0 text-sm font-semibold text-foreground">
          Picture or multimedia memorabilia <span className="font-normal text-foreground-soft">(optional note)</span>
          <span className="mt-1 block text-xs font-normal text-foreground-soft">Describe photos or a memory from your internship.</span>
          <textarea
            maxLength={2000}
            rows={5}
            value={values.memorabilia_note}
            onChange={(event) => setValues((current) => ({ ...current, memorabilia_note: event.target.value }))}
            className={fieldClass}
            placeholder="Describe a meaningful photo or other memorabilia..."
          />
        </label>
        <SummaryReportImagePicker record={record} {...imageProps} />
      </div>
      <SummaryReportEditorActions record={record} words={words} mutation={mutation} onCancel={onCancel} />
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </form>
  );
}
