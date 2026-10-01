"use client";
import { Clock, Eye, Megaphone } from "lucide-react";
import { format } from "date-fns";
import Modal from "./Modal";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function InboxAnnouncementItem({
  notificationData,
  handleMarkAsRead,
  isPending,
}) {
  const isLongText = notificationData.content.length >= 300;

  const firstDot = notificationData.content.indexOf(".");

  const formattedContent = isLongText
    ? notificationData.content.substring(0, firstDot) + "."
    : notificationData.content;

  return (
    <Modal
      onClick={() => handleMarkAsRead(notificationData.notification_id)}
      title={"Announcement"}
      titleIcon={
        <span className="text-blue-800 bg-blue-100 p-1 rounded-full">
          <Megaphone className="h-5 w-5" />
        </span>
      }
      titleStyles={"flex items-center gap-2"}
      description={`Announcement • ${format(new Date(notificationData.created_at), "MM/dd/yyyy")}`}
      trigger={
        <>
          <span className="text-blue-800 bg-blue-100 p-1 rounded-full self-start">
            <Megaphone className="h-5 w-5" />
          </span>

          <div className="items-start justify-self-start flex flex-col gap-1 text-muted-foreground">
            <div className="flex gap-2 items-center">
              <h3 className="font-semibold text-foreground">Announcement</h3>

              <span className=" text-xs text-primary-emphasis font-semibold">
                {notificationData.notification_message}
              </span>

              {notificationData.is_read ? null : (
                <span className="p-1 rounded bg-primary h-fit"></span>
              )}
            </div>

            <p className="text-xs tracking-wide line-clamp-4 w-full max-w-100 text-start">
              {isLongText ? formattedContent : notificationData.content}
            </p>

            <p className="flex items-center gap-1 text-xs">
              <span>
                <Clock className="h-3 w-3" />{" "}
              </span>{" "}
              {format(new Date(notificationData.created_at), "MM/dd/yyyy")}
            </p>
          </div>

          <span className="text-foreground-soft p-1 rounded-full self-start">
            <Eye className="h-4 w-4" />
          </span>
        </>
      }
      triggerStyles={`${!notificationData.is_read ? "bg-muted" : ""} w-full border border-border px-4 py-2 rounded-sm grid grid-cols-[auto_1fr_auto] gap-4 hover:bg-muted transition-colors cursor-pointer`}
    >
      <ViewAnnouncement
        announcementData={notificationData}
        formattedContent={
          isLongText ? formattedContent : notificationData.content
        }
      />
    </Modal>
  );
}

function ViewAnnouncement({ announcementData, formattedContent }) {
  return (
    <>
      <p className="text-sm border border-border px-4 py-2 rounded-sm flex flex-col gap-2">
        {announcementData.announcement_title} • {formattedContent}
      </p>
      <DialogFooter>
        <div className="flex font-semibold w-full justify-end mt-4 gap-1">
          <DialogClose asChild>
            <Button variant="outline" className={"w-fit"}>
              Close
            </Button>
          </DialogClose>

          <Link
            // href={`/announcements/${announcementData.id}`}
            href={`/announcements`}
            className={
              "bg-primary hover:bg-primary-400 w-fit rounded-sm text-white text-sm font-medium p-2"
            }
          >
            View full
          </Link>
        </div>
      </DialogFooter>
    </>
  );
}

export default InboxAnnouncementItem;
