"use client";

import ModalForm from "@/components/ui/ModalForm";
import { useState } from "react";

function WeeklyNarrativeForm({
  handleAction,
  isPending,
  data = null,
  type = "",
}) {
  // Prefill saved coverage when editing; legacy blanks must be completed by the user.
  const [dateFrom, setDateFrom] = useState(data?.date_from || "");
  const [dateTo, setDateTo] = useState(data?.date_to || "");
  return (
    <ModalForm.Root action={handleAction}>
      {type === "edit" && (
        <input type="hidden" name="narrativeId" defaultValue={data?.id} />
      )}

      <ModalForm.Section title="Narrative Details">
        <ModalForm.Row>
          <ModalForm.Field label="Week number">
            <ModalForm.Input
              type="number"
              name="week_number"
              placeholder="0"
              defaultValue={type === "edit" ? data.week_number : ""}
              disabled={isPending}
              min={1}
              max={52}
              required
            />
          </ModalForm.Field>

          <ModalForm.Field label="Title">
            <ModalForm.Input
              type="text"
              name="title"
              placeholder="Your objective for the week..."
              defaultValue={type === "edit" ? data.title : ""}
              disabled={isPending}
              maxLength={50}
              required
            />
          </ModalForm.Field>
        </ModalForm.Row>

        <ModalForm.Row>
          <ModalForm.Field label="Start date">
            <ModalForm.Input type="date" name="date_from" value={dateFrom}
              onChange={(event) => {
                const next = event.target.value;
                setDateFrom(next);
                // Clear an end date that becomes invalid after changing/clearing the start.
                // The backend validates both dates again before saving.
                if (!next || (dateTo && dateTo < next)) setDateTo("");
              }} disabled={isPending} required />
          </ModalForm.Field>
          <ModalForm.Field label="End date">
            <ModalForm.Input type="date" name="date_to" value={dateTo} min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)} disabled={isPending || !dateFrom} required />
          </ModalForm.Field>
        </ModalForm.Row>
        <p className="text-xs leading-relaxed text-foreground-subtle">Choose the dates covered by this narrative, including both the start and end date. This range appears on the card and printed journal.</p>

        <ModalForm.Field label="Narrative">
          <ModalForm.Textarea
            name="narrative"
            placeholder="In paragraph form, reflect on your objective, daily accomplishments, and what you learned (knowledge, skills, and values)."
            className="min-h-28 sm:min-h-50"
            defaultValue={type === "edit" ? data.narrative : ""}
            disabled={isPending}
            maxLength={2000}
            required
          />
        </ModalForm.Field>
      </ModalForm.Section>

      <ModalForm.Actions isPending={isPending} closeOnSubmit={false} disableCancelWhilePending submitLabel="Save" />
    </ModalForm.Root>
  );
}

export default WeeklyNarrativeForm;
