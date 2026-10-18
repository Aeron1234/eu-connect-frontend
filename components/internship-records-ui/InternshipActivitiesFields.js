"use client";

import InternshipFormSection from "./InternshipFormSection";

import { labelClass, textareaClass } from "./internshipFormStyles";

export default function InternshipActivitiesFields({ internshipForm, setInternshipForm, isPending, status }) {
  return (
    <InternshipFormSection number="03" title="Activities" description="Describe the work and responsibilities you expect during your internship.">
      <div className="flex flex-col">
        <label htmlFor="description" className={labelClass}>
          Description *
        </label>
        <textarea
          name="description"
          placeholder="Assisting developers on front-end development..."
          id="description"
          rows={4}
          className={textareaClass}
          value={internshipForm.description}
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

    </InternshipFormSection>
  );
}
