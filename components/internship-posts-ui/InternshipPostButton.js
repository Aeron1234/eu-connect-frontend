"use client";

import { useTransition } from "react";
import InternshipPostForm from "./InternshipPostForm";
import { toastAndAction } from "../../lib/helpers";
import { createInternshipPosting } from "@/lib/server-actions/internship-posts-actions";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { internshipPostsKeys } from "@/lib/cache/internship-posts-queries";

function InternshipPostButton({ courses, onSuccess = null }) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { user } = useUser();

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Posting internship...",
        successLabel: "Internship posted.",
        errorLabel: "Failed to post internship.",
        action: createInternshipPosting,
        formData,
      });
      if (result?.success) {
        await queryClient.invalidateQueries({
          queryKey: internshipPostsKeys.all(user.id),
        });
        onSuccess?.(result);
      }
    });
  }

  return (
    <InternshipPostForm
      handleAction={handleAction}
      courses={courses}
      isPending={isPending}
    />
  );
}

export default InternshipPostButton;
