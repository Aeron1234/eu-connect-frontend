"use client";
import { ListChecks } from "lucide-react";
import Modal from "./Modal";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { markAllAsRead } from "@/lib/server-actions/notifications-actions";
import { useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";

function MarkAllAsReadButton({
  data,
  unreadCount,
  notifications,
  setNotifications,
}) {
  const [isPending, startTransition] = useTransition();

  if (data.length === 0 || unreadCount === 0) return null;

  function handleAction(formData) {
    const updatedNotifications = notifications.map((item) => {
      return { ...item, is_read: 1 };
    });

    setNotifications(updatedNotifications);

    startTransition(
      async () =>
        await toastAndAction({
          loadingLabel: "Marking all as read...",
          successLabel: "All notifications marked as read.",
          errorLabel: "Failed to mark all as read.",
          action: markAllAsRead,
          formData: null,
        }),
    );
  }

  return (
    <Modal
      trigger={
        <>
          <ListChecks className="h-4 w-4" />
          <span>Mark all as read</span>
        </>
      }
      title={"Mark all as read"}
      triggerStyles="h-fit text-sm text-stone-800 font-semibold hover:bg-stone-100 hover:text-primary-500 cursor-pointer px-2 py-1 rounded transition-colors flex items-center gap-1"
      description={"Are you sure?"}
    >
      <form action={handleAction}>
        <DialogFooter>
          <div className="flex gap-2 font-semibold w-full justify-end">
            <DialogClose asChild>
              <Button variant="outline" className={"w-fit"}>
                Cancel
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                className={"bg-primary-500 hover:bg-primary-400 w-fit "}
                type="submit"
                disabled={isPending}
                // onClick={() => toast.success("Event has been created")}
              >
                {isPending ? (
                  <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </form>
    </Modal>
  );
}

export default MarkAllAsReadButton;
