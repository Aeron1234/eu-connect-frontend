"use client";

import { Dialog } from "@/components/ui/dialog";
import FormDialogContent from "@/components/ui/FormDialogContent";
import ModalForm, { controlClass } from "@/components/ui/ModalForm";
import { modalFormPrimaryClass, modalFormCancelClass, modalFormLabelClass, modalFormSelectContentClass } from "@/components/ui/modalFormStyles";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function DepartmentCourseEditDialog({
  editing,
  setEditing,
  editError,
  setEditError,
  isSavingEdit,
  handleEdit,
  departments,
}) {
  return (
    <Dialog
      open={Boolean(editing)}
      onOpenChange={(open) => {
        if (!open && !isSavingEdit) {
          setEditing(null);
          setEditError("");
        }
      }}
    >
      <FormDialogContent
        title={`Edit ${editing?.kind === "course" ? "course" : "department"}`}
        description="Update the name, code, and department where applicable."
      >
        {editing && (
          <ModalForm.Root onSubmit={handleEdit}>
            <ModalForm.Section title={editing.kind === "course" ? "Course details" : "Department details"}>
              <ModalForm.Field label="Name">
                <ModalForm.Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  disabled={isSavingEdit}
                />
              </ModalForm.Field>
              <ModalForm.Field label="Code">
                <ModalForm.Input
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  disabled={isSavingEdit}
                />
              </ModalForm.Field>
              {editing.kind === "course" && (
                <div className="min-w-0">
                  <span id="edit-course-department" className={modalFormLabelClass}>Department</span>
                  <Select
                    value={editing.departmentId}
                    onValueChange={(value) => setEditing({ ...editing, departmentId: value })}
                    disabled={isSavingEdit}
                  >
                    <SelectTrigger aria-labelledby="edit-course-department" className={controlClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start" className={modalFormSelectContentClass}>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)} className="whitespace-normal break-words py-2">{d.code} — {d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
            </ModalForm.Section>
            <ModalForm.Footer>
              <button type="button" onClick={() => setEditing(null)} disabled={isSavingEdit} className={modalFormCancelClass}>
                Cancel
              </button>
              <button type="submit" disabled={isSavingEdit} className={`${modalFormPrimaryClass} disabled:opacity-50`}>
                {isSavingEdit ? "Saving..." : "Save changes"}
              </button>
            </ModalForm.Footer>
          </ModalForm.Root>
        )}
      </FormDialogContent>
    </Dialog>
  );
}
