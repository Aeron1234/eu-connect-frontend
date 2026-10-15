import { Pencil, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import DeleteForm from "../ui/DeleteForm";
import InternshipPostForm from "./InternshipPostForm";

export default function InternshipPostActions({
  item,
  courses,
  canEdit,
  canDelete,
  handleUpdate,
  handleDelete,
  isPending,
}) {
  return (
    (canEdit || canDelete) && (
      <div className="flex items-center gap-1 flex-shrink-0">
        {canEdit && (
          <Modal variant="form"
            trigger={
              <div
                aria-label={`Edit ${item.position}`}
                className="p-1.5 rounded-md text-foreground-subtle hover:bg-muted hover:text-primary-emphasis transition-colors cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
              </div>
            }
            title={
              <span className="text-primary-emphasis">
                Update internship post
              </span>
            }
          >
            <InternshipPostForm
              handleAction={handleUpdate}
              isPending={isPending}
              courses={courses}
              type={"edit"}
              data={item}
            />
          </Modal>
        )}
        {canDelete && (
          <Modal variant="confirmation"
            trigger={
              <div
                aria-label={`Delete ${item.position}`}
                className="p-1.5 rounded-md text-foreground-subtle hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </div>
            }
            title={
              <span className="text-primary-emphasis">
                Delete internship post
              </span>
            }
          >
            <DeleteForm
              handleAction={handleDelete}
              isPending={isPending}
              name={"postingId"}
              id={item.id}
            />
          </Modal>
        )}
      </div>
    )
  );
}
