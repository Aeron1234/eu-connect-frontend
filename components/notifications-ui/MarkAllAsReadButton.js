"use client";
import { ListChecks } from "lucide-react";
import Modal from "../ui/Modal";
import ModalForm from "@/components/ui/ModalForm";
import { markAllAsRead } from "@/lib/server-actions/notifications-actions";
import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";

function MarkAllAsReadButton({ data, unreadCount, onChanged }) {
  const [isPending, startTransition] = useTransition();

  if (data.length === 0 || unreadCount === 0) return null;

  function handleAction() {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Marking all as read...",
        successLabel: "All notifications marked as read.",
        errorLabel: "Failed to mark all as read.",
        action: markAllAsRead,
      });
      if (result?.success) onChanged?.();
    });
  }

  return (
    <Modal variant="confirmation"
      trigger={
        <>
          <ListChecks className="h-4 w-4" />
          <span>Mark all as read</span>
        </>
      }
      title={"Mark all as read"}
      triggerStyles="h-fit text-sm text-foreground font-semibold hover:bg-muted hover:text-primary-emphasis cursor-pointer px-2 py-1 rounded transition-colors flex items-center gap-1"
    >
      <ModalForm.Root action={handleAction}>
        <ModalForm.Confirmation>
          All unread notifications will be marked as read.
        </ModalForm.Confirmation>
        <ModalForm.Actions isPending={isPending} submitLabel="Confirm" />
      </ModalForm.Root>
    </Modal>
  );
}

export default MarkAllAsReadButton;
