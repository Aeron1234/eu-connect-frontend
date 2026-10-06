"use client";

import { Megaphone, Plus } from "lucide-react";
import Modal from "../ui/Modal";
import AnnouncementForm from "../announcements-ui/AnnouncementForm";
import { useTransition } from "react";
import { createAnnouncement } from "@/lib/server-actions/announcements-actions";
import { toastAndAction } from "../../lib/helpers";
import { useUser } from "@/contexts/UserContext";
import TitleButton from "../ui/TitleButton";

function PostAnnouncementButton({ categories, onPosted }) {
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
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success && onPosted) onPosted();
    });
  }

  return (
    <Modal
      trigger={
        <TitleButton>
          <Plus className="w-4 h-4" /> Announce
        </TitleButton>
      }
      title="Post Announcement"
      titleIcon={
        <span className="text-primary-emphasis">
          <Megaphone className="h-5 w-5" />
        </span>
      }
    >
      <AnnouncementForm
        categories={categories}
        isPending={isPending}
        handleAction={handleAction}
        type={"create"}
      />
    </Modal>
  );
}

export default PostAnnouncementButton;
