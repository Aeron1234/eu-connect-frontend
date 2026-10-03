"use client";

import { useTransition } from "react";
import InternshipPostForm from "./InternshipPostForm";
import { toastAndAction } from "../../lib/helpers";
import { createInternshipPosting } from "@/lib/server-actions/internship-posts-actions";

function InternshipPostButton({ userRole, courses, onSuccess = null }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Posting internship...",
        successLabel: "Internship posted.",
        errorLabel: "Failed to post internship.",
        action: createInternshipPosting,
        formData,
      }),
    );
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
