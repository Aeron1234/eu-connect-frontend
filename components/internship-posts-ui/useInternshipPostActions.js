"use client";

import { useTransition } from "react";
import { toastAndAction, useFavoriteToggle } from "../../lib/helpers";
import {
  deleteInternshipPosting,
  toggleInternshipFavorite,
  updateInternshipPosting,
} from "@/lib/server-actions/internship-posts-actions";

// Provide one posting card's edit/delete transitions, favorite control and UI permissions.
// Parent callbacks reconcile list membership after confirmed mutations.
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
        args: [formData],
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
        args: [formData],
      });

      if (result?.success) {
        // Prefer persisted scalar fields and course links from the backend response.
        // The form-data merge is only a fallback for older success responses.
        onUpdate?.(result.data ?? { ...item, ...Object.fromEntries(formData) });
      }
    });
  }

  // Mirror the distinct UI permissions: owner edits; owner or admin deletes.
  // These flags supplement the backend checks and do not grant API access.
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
