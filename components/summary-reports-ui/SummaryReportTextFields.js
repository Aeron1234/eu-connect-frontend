"use client";

import { SECTIONS, fieldClass } from "./summaryReportFields";

export default function SummaryReportTextFields({ values, setValues }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {SECTIONS.map(({ key, title, hint }) => (
        <label key={key} className="block min-w-0 text-sm font-semibold text-foreground">
          {title} <span className="text-primary-emphasis">*</span>
          <span className="mt-1 block text-xs font-normal text-foreground-soft">{hint}</span>
          <textarea
            required
            maxLength={6000}
            rows={7}
            value={values[key]}
            onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
            className={fieldClass}
            placeholder={`Write about ${title.toLowerCase()} in paragraph form...`}
          />
        </label>
      ))}
    </div>
  );
}
