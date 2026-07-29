import { Eye, Info } from "lucide-react";
import Modal from "./Modal";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function InboxStatus({ notificationData, handleMarkAsRead, title = "" }) {
  return (
    <Modal
      onClick={() => handleMarkAsRead(notificationData.notification_id)}
      title={notificationData.notification_title}
      titleIcon={
        <span className="text-stone-800 p-1 rounded-full">
          <Info className="h-5 w-5" />
        </span>
      }
      titleStyles={"flex items-center gap-2"}
      description={`Status of your internship record for ${notificationData.company_name}`}
      trigger={
        <>
          <span className=" bg-stone-200 p-1 rounded-full self-start">
            <Info className="h-5 w-5" />
          </span>

          <div className="items-start justify-self-start flex flex-col gap-1 text-stone-500">
            <div className="flex gap-2 items-center">
              <h3 className="font-semibold text-stone-800">
                {notificationData.notification_title}
              </h3>

              {notificationData.is_read ? null : (
                <span className="p-1 rounded bg-primary-500 h-fit"></span>
              )}
            </div>

            <p className="flex items-center gap-1 text-xs">
              {notificationData.notification_message}
            </p>
          </div>

          <span className="text-stone-600 p-1 rounded-full self-start">
            <Eye className="h-4 w-4" />
          </span>
        </>
      }
      triggerStyles={`${!notificationData.is_read ? "bg-stone-100" : ""} w-full border border-stone-300 px-4 py-2 rounded-sm grid grid-cols-[auto_1fr_auto] gap-4 hover:bg-stone-100 transition-colors cursor-pointer`}
    >
      <p className="text-sm border border-stone-300 px-4 py-2 rounded-sm flex flex-col gap-2">
        {notificationData.notification_message}
      </p>
      <DialogFooter>
        <div className="flex font-semibold w-full justify-end mt-4 gap-1">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </Modal>
  );
}

export default InboxStatus;
