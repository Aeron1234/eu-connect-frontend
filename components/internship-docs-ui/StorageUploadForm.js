"use client";

import ModalForm from "@/components/ui/ModalForm";
import StorageRequirementPicker from "./StorageRequirementPicker";
import useStorageUploadForm from "./useStorageUploadForm";

function StorageUploadForm({ fileRequirementTypes = [], currentUserId = "", internshipId = "" }) {
  const { handleAction, isPending, pickerProps } = useStorageUploadForm({
    fileRequirementTypes,
    currentUserId,
    internshipId,
  });

  return (
    <ModalForm.Root action={handleAction} className="w-full text-sm">
      <ModalForm.Section title="File Details" description="Name your document and choose the requirement it fulfills.">
        <ModalForm.Field label="Company Name">
          <ModalForm.Input
            type="text"
            name="company_name"
            disabled={isPending}
          />
        </ModalForm.Field>

        <ModalForm.Field label="File Name">
          <ModalForm.Input
            type="text"
            name="file_name"
            disabled={isPending}
          />
        </ModalForm.Field>

        <ModalForm.Field label="File">
          <ModalForm.Input
            type="file"
            name="file"
            accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
            disabled={isPending}
          />
        </ModalForm.Field>

        <StorageRequirementPicker {...pickerProps} isPending={isPending} />
      </ModalForm.Section>

      <ModalForm.Actions isPending={isPending} submitLabel="Save" />
    </ModalForm.Root>
  );
}

export default StorageUploadForm;
