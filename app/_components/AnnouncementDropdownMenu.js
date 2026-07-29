import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "./Modal";
import { Pin, PinOff, SquarePen, Trash2 } from "lucide-react";
import AnnouncementDelete from "./AnnouncementDelete";
import AnnouncementTogglePin from "./AnnouncementTogglePin";
import AnnouncementUpdate from "./AnnouncementUpdate";

function AnnouncementDropdownMenu({
  trigger,
  userId,
  announcementId,
  is_pinned,
  data = null,
  categories,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Select option</DropdownMenuLabel>
          <DropdownMenuRadioGroup className={"flex flex-col pb-1"}>
            <Modal
              title={`${!is_pinned ? "Pin" : "Unpin"}  announcement`}
              description={`Announcement will be ${!is_pinned ? "pinned" : "unpinned"} for all the users.`}
              trigger={
                <div className="flex gap-2 items-center py-1 px-2 text-sm text-stone-600 font-semibold rounded-sm hover:bg-stone-100 transition-colors">
                  {!is_pinned ? (
                    <>
                      <Pin className="h-4 w-4" /> Pin
                    </>
                  ) : (
                    <>
                      <PinOff className="h-4 w-4" /> Unpin
                    </>
                  )}
                </div>
              }
            >
              <AnnouncementTogglePin
                announcementId={announcementId}
                is_pinned={is_pinned}
              />
            </Modal>
            {userId && (
              <Modal
                title={"Update announcement"}
                description="Do you want to change something?"
                trigger={
                  <div className="flex gap-2 items-center py-1 px-2 text-sm text-stone-600 font-semibold rounded-sm hover:bg-stone-100 transition-colors">
                    <SquarePen className="h-4 w-4" /> Edit
                  </div>
                }
              >
                <AnnouncementUpdate
                  data={data}
                  announcementId={announcementId}
                  categories={categories}
                />
              </Modal>
            )}
            <Modal
              title={
                <span className={`text-red-600`}>Delete Announcement</span>
              }
              trigger={
                <div className="flex gap-2 items-center py-1 px-2 text-sm text-stone-600 font-semibold rounded-sm hover:bg-stone-100 transition-colors">
                  <Trash2 className="h-4 w-4" /> Delete
                </div>
              }
              description={`Are you sure you want to delete this announcement?`}
            >
              <AnnouncementDelete announcementId={announcementId} />
            </Modal>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AnnouncementDropdownMenu;
