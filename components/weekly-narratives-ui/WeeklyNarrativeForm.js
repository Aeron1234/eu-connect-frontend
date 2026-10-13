"use client";

import ModalForm from "@/components/ui/ModalForm";

function WeeklyNarrativeForm({
  handleAction,
  isPending,
  data = null,
  type = "",
}) {
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

      <ModalForm.Actions isPending={isPending} disableCancelWhilePending submitLabel="Save" />
    </ModalForm.Root>
  );
}

export default WeeklyNarrativeForm;
