"use client";

import { useTransition } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { toastAndAction } from "../_services/helpers";
import { updateAnnouncement } from "../_services/dept-head-actions";

function AnnouncementUpdate({ data = null, categories }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    formData.append("id", data.id);

    const handlers = {
      loadingLabel: "Posting announcement...",
      successLabel: "Announcement was posted.",
      errorLabel: "Updating announcement failed.",
      action: updateAnnouncement,
      formData,
    };

    startTransition(async () => await toastAndAction(handlers));
  }

  return (
    <AnnouncementForm
      categories={categories}
      isPending={isPending}
      handleAction={handleAction}
      type={"edit"}
      data={data}
    />
  );
}

export default AnnouncementUpdate;
