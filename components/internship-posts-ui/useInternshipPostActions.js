"use client";

import { useTransition } from "react";
import { toastAndAction, useFavoriteToggle } from "../../lib/helpers";
import {
  deleteInternshipPosting,
  toggleInternshipFavorite,
  updateInternshipPosting,
} from "@/lib/server-actions/internship-posts-actions";

export default function useInternshipPostActions({
  item,
  userRole,
  onUpdate,
  onDelete,
  onFavoriteSettled,
}) {
  const [isPending, startTransition] = useTransition();
  const { isFavorited, toggle: toggleFavorite } = useFavoriteToggle(
    item.id,
    item.isFavorited,
    toggleInternshipFavorite,
    onFavoriteSettled,
  );

  function handleDelete(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting post...",
        successLabel: "Post deleted.",
        errorLabel: "Failed to delete post.",
        action: deleteInternshipPosting,
        formData,
      });

      if (result?.success) {
        onDelete?.();
      }
    });
  }

  function handleUpdate(formData) {
    formData.append("postingId", item.id);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating post...",
        successLabel: "Post updated.",
        errorLabel: "Failed to update post.",
        action: updateInternshipPosting,
        formData,
      });

      if (result?.success) {
        onUpdate?.(result.data ?? { ...item, ...Object.fromEntries(formData) });
      }
    });
  }

  const canDelete = item.isOwner || userRole === "admin";
  const canEdit = item.isOwner;

  return {
    isPending,
    isFavorited,
    toggleFavorite,
    handleDelete,
    handleUpdate,
    canDelete,
    canEdit,
  };
}
