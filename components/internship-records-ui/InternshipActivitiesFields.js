"use client";

import { labelClass, textareaClass } from "./internshipFormStyles";

export default function InternshipActivitiesFields({ internshipForm, setInternshipForm, isPending, status }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-background/60 p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground sm:text-base">Activities</h3>
      <div className="flex flex-col">
        <label htmlFor="description" className={labelClass}>
          Description *
        </label>
        <textarea
          name="description"
          placeholder="Assisting developers on front-end development..."
          id="description"
          rows={3}
          className={textareaClass}
          defaultValue={internshipForm.description}
          onChange={(e) =>
            setInternshipForm({
              ...internshipForm,
              description: e.target.value,
            })
          }
          disabled={isPending || status}
          required
        />
      </div>

    </section>
  );
}
