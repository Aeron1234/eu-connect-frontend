"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { summaryReportKeys } from "@/lib/cache/summary-reports-queries";
import { saveSummaryReport } from "@/lib/server-actions/summary-reports-actions";
import { EMPTY } from "./summaryReportFields";

// Own summary text, retained/new images and the save mutation for one internship.
// Return editor state/actions; preserve the draft on failure and release local preview URLs.
export default function useSummaryReportEditor({ record, onSaved }) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      Object.keys(EMPTY).map((key) => [key, record[key] || ""]),
    ),
  );
  const [images, setImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [error, setError] = useState("");
  const previewUrls = useRef([]);
  useEffect(
    () => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  // Track saved removals separately from new local files. The combined image cap
  // counts retained saved images plus newly selected files.
  const retainedImages = (record.images || []).filter(
    (image) => !removeImageIds.includes(image.id),
  );
  const words = Object.values(values)
    .join(" ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
  const mutation = useMutation({
    mutationFn: (formData) =>
      toastAndAction({
        loadingLabel: record.report_id
          ? "Updating summary report..."
          : "Submitting summary report...",
        successLabel: record.report_id
          ? "Summary report updated."
          : "Summary report submitted.",
        errorLabel: "Could not save your report.",
        timeoutMs: 120000,
        timeoutLabel: "Upload confirmation timed out. Refresh this page before trying again.",
        action: async (internshipId, data) => {
          try {
            return await saveSummaryReport(
              internshipId,
              data,
              Boolean(record.report_id),
            );
          } catch {
            return {
              success: false,
              error: "Could not save your report. Please try again.",
            };
          }
        },
        args: [record.internship_id, formData],
      }),
    // A resolved action may still contain failure/timeout. Refresh uncertain outcomes,
    // but close the editor only after confirmed success so draft text/images survive errors.
    onSuccess: async (result) => {
      if (result?.timedOut) {
        void queryClient.invalidateQueries({ queryKey: summaryReportKeys.list(user.id) });
      }
      if (!result?.success) return;
      await queryClient.invalidateQueries({
        queryKey: summaryReportKeys.list(user.id),
      });
      onSaved();
    },
    onError: () => setError("Could not save your report. Please try again."),
  });

  function submit(event) {
    event.preventDefault();
    setError("");
    // This client word cap is shared with backend text validation; actual rendered
    // page count is checked separately during PDF generation.
    if (words > 900) {
      setError(
        "Keep the report within 900 words so it can fit the three-page format.",
      );
      return;
    }
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    // Preserve selection order for new images. The server appends them after saved
    // images and validates removal IDs against the report being edited.
    images.forEach(({ file }) => formData.append("images", file));
    formData.set("remove_image_ids", JSON.stringify(removeImageIds));
    if (removeAttachment) formData.set("remove_attachment", "true");
    mutation.mutate(formData);
  }

  // Reject the whole selection on type/size/count failure. Local preview URLs belong
  // to this editor and are released on removal or editor unmount.
  function selectImages(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (
      selected.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024 ||
          !file.size,
      )
    ) {
      setError("Choose JPG, PNG, or WebP images up to 5 MB each.");
      return;
    }
    if (retainedImages.length + images.length + selected.length > 6) {
      setError(
        "A report can have up to six images. Remove one before adding more.",
      );
      return;
    }
    setError("");
    const previews = selected.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    previewUrls.current.push(...previews.map(({ url }) => url));
    setImages((current) => [...current, ...previews]);
  }

  function removeSelectedImage(url) {
    URL.revokeObjectURL(url);
    previewUrls.current = previewUrls.current.filter((item) => item !== url);
    setImages((current) => current.filter((item) => item.url !== url));
  }
  return {
    values,
    setValues,
    images,
    retainedImages,
    setRemoveImageIds,
    removeAttachment,
    setRemoveAttachment,
    error,
    words,
    mutation,
    submit,
    selectImages,
    removeSelectedImage,
  };
}
