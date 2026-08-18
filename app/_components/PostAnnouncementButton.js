"use client";

import { Megaphone, Plus } from "lucide-react";
import Modal from "./Modal";
import AnnouncementForm from "./AnnouncementForm";
import { useTransition } from "react";
import { createAnnouncement } from "../_services/dept-head-actions";
import { toastAndAction } from "../_services/helpers";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

function PostAnnouncementButton({ categories }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // Initialize router
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { user } = useUser();

  const userRole = user.role;

  if (!["department_head", "admin"].includes(userRole)) return null;

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Posting announcement...",
      successLabel: "Announcement was posted.",
      errorLabel: "Updating announcement failed.",
      action: createAnnouncement,
      formData,
    };

    startTransition(async () => {
      // 1. Run the server action
      const result = await toastAndAction(handlers);

      // 2. If successful, navigate to Page 1
      if (result?.success || !result?.error) {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");

        // Use router.push to move the user back to the first page
        router.push(`${pathname}?${params.toString()}`);
      }
    });
  }

  return (
    <Modal
      trigger={
        <div className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition">
          <Plus className="w-4 h-4" />
          <span className="text-white text-sm font-semibold">Announce</span>
        </div>
      }
      triggerStyles="max-xs:w-full"
      title="Post Announcement"
      titleIcon={
        <span className="text-primary-500">
          <Megaphone className="h-5 w-5" />
        </span>
      }
      description="Provide clear and concise information."
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
