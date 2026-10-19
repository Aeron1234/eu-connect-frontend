"use client";

import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import AnnouncementForm from "../announcements-ui/AnnouncementForm";
import { useTransition } from "react";
import { createAnnouncement } from "@/lib/server-actions/announcements-actions";
import { toastAndAction } from "../../lib/helpers";
import { useUser } from "@/contexts/UserContext";
import TitleButton from "../ui/TitleButton";
import ModalFormSkeleton from "@/components/skeletons/ModalFormSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";

function PostAnnouncementButton({ categories, onPosted, categoriesLoading = false, categoriesError, onRetryCategories }) {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const userRole = user.role;

  if (!["department_head", "admin"].includes(userRole)) return null;

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Posting announcement...",
      successLabel: "Announcement was posted.",
      errorLabel: "Posting announcement failed.",
      action: createAnnouncement,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success && onPosted) onPosted();
    });
  }

  return (
    <Modal variant="form"
      trigger={
        <TitleButton>
          <Plus className="w-4 h-4" /> Announce
        </TitleButton>
      }
      title="Post Announcement"
    >
      {categoriesLoading ? (
        <ModalFormSkeleton />
      ) : categoriesError ? (
        <div className="overflow-y-auto p-4 sm:p-6">
          <ErrorUI error={typeof categoriesError === "string" ? new Error(categoriesError) : categoriesError} reset={onRetryCategories} compact logError={false} />
        </div>
      ) : <AnnouncementForm
        categories={categories}
        isPending={isPending}
        handleAction={handleAction}
        type={"create"}
      />}
    </Modal>
  );
}

export default PostAnnouncementButton;
