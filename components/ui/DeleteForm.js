import ModalForm from "@/components/ui/ModalForm";

function DeleteForm({
  handleAction,
  isPending,
  id,
  name,
}) {
  return (
    <ModalForm.Root action={handleAction}>
      <input type="hidden" name={name} value={id} />
      <ModalForm.Confirmation title="Confirm Deletion">
        The selected item will be deleted.
      </ModalForm.Confirmation>
      <ModalForm.Actions isPending={isPending} submitLabel="Delete" />
    </ModalForm.Root>
  );
}

export default DeleteForm;
