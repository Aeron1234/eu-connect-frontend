import ModalForm from "@/components/ui/ModalForm";

function DeleteForm({
  handleAction,
  isPending,
  id,
  name,
  description = "The selected item will be deleted.",
  submitLabel = "Delete",
}) {
  return (
    <ModalForm.Root action={handleAction}>
      <input type="hidden" name={name} value={id} />
      <ModalForm.Confirmation title="Confirm Deletion">
        {description}
      </ModalForm.Confirmation>
      <ModalForm.Actions isPending={isPending} submitLabel={submitLabel} />
    </ModalForm.Root>
  );
}

export default DeleteForm;
