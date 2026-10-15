"use client";

import { format } from "date-fns";
import { Dialog } from "@/components/ui/dialog";
import FormDialogContent from "@/components/ui/FormDialogContent";
import ModalForm from "@/components/ui/ModalForm";
import { parseDay } from "./calendarDateUtils";

export default function CalendarEditorDialog({ editor, setEditor, busy, saveEditor, selected, role }) {
  return (
    <Dialog
      open={!!editor}
      onOpenChange={open => {
        if (!open && !busy) setEditor(null);
      }}
    >
      <FormDialogContent
        title={`${editor?.item ? "Edit" : "Add"} ${editor?.kind === "todo" ? "to-do" : "schedule"}`}
      >
        {editor && <ModalForm.Root onSubmit={saveEditor}>
            <ModalForm.Section title={editor.kind === "todo" ? "Your daily task" : "Schedule details"}>
              <ModalForm.Field label="Title">
                <ModalForm.Input
                  name="title"
                  maxLength={160}
                  required
                  defaultValue={editor.item?.title || ""}
                  autoFocus
                />
              </ModalForm.Field>
              {editor.kind === "schedule" && <>
                  <ModalForm.Field label="Details (optional)">
                    <ModalForm.Textarea
                      name="description"
                      maxLength={2000}
                      defaultValue={editor.item?.description || ""}
                    />
                  </ModalForm.Field>
                  <ModalForm.Row>
                    <ModalForm.Field label="Start date">
                      <ModalForm.Input
                        type="date"
                        name="starts_on"
                        required
                        defaultValue={editor.item?.starts_on || selected}
                      />
                    </ModalForm.Field>
                    <ModalForm.Field label="End date">
                      <ModalForm.Input
                        type="date"
                        name="ends_on"
                        required
                        defaultValue={editor.item?.ends_on || selected}
                      />
                    </ModalForm.Field>
                  </ModalForm.Row>
                  <p className="text-xs text-foreground-subtle">
                    {role === "admin" && editor.item?.department_id == null ? "School-wide: all students will be notified." : "Students in this department will be notified."}
                  </p>
                </>}
              {editor.kind === "todo" && <p className="text-xs text-foreground-subtle">
                  {"Private to you · "}
                  {format(parseDay(selected), "MMMM d, yyyy")}
                </p>}
            </ModalForm.Section>
            <ModalForm.Actions
              isPending={busy}
              closeOnSubmit={false}
              submitLabel={editor.item ? "Save changes" : editor.kind === "todo" ? "Add to-do" : "Publish schedule"}
            />
          </ModalForm.Root>}
      </FormDialogContent>
    </Dialog>
  );
}
