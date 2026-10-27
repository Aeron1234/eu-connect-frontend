"use client";

import SelectionRowsSkeleton from "@/components/skeletons/SelectionRowsSkeleton";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import FormDialogContent from "@/components/ui/FormDialogContent";
import { Button } from "@/components/ui/button";
import ModalForm from "@/components/ui/ModalForm";
import { modalFormCancelClass, modalFormPrimaryClass } from "@/components/ui/modalFormStyles";
import ErrorUI from "@/components/ui/ErrorUI";
import { feedbackInternOptions } from "@/lib/cache/feedback-queries";
import { feedbackCategories, audienceDepartments, feedbackAudience, validateFeedbackFiles } from "@/lib/feedback.mjs";
import { createFeedback, updateFeedback } from "@/lib/server-actions/feedback-actions";
import { toastAndAction } from "@/lib/helpers";
import { showActionError } from "@/lib/toast-and-action.mjs";
import FeedbackSelect from "./FeedbackSelect";
import FeedbackAttachments from "./FeedbackAttachments";

export default function FeedbackComposer({ userId, onClose, onPosted, initialData = null }) {
  const editing = Boolean(initialData?.post?.id);
  const [category, setCategory] = useState(initialData?.post?.category || "platform_feedback");
  const [selected, setSelected] = useState(initialData?.mentions?.map(mention => mention.internship_id) || []);
  const [removed, setRemoved] = useState([]);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const internship = category === "internship_feedback";
  const query = useQuery({ ...feedbackInternOptions(userId), enabled: internship });
  const available = new Map((query.data?.interns || []).map(intern => [intern.id, intern]));
  // Keep existing mention snapshots available during edits even when they no longer
  // appear in the current supervised-intern list. New tags remain backend-validated.
  for (const mention of initialData?.mentions || []) {
    if (!available.has(mention.internship_id)) available.set(mention.internship_id, { ...mention, id: mention.internship_id });
  }
  const interns = [...available.values()];
  const existingAttachments = initialData?.attachments || [];
  const visible = interns.filter(i => [i.student_name, i.company_name, i.department_code].join(" ").toLowerCase().includes(search.toLowerCase()));
  const departments = audienceDepartments(interns, selected);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const fileError = validateFeedbackFiles(files);
    if (fileError) return showActionError(toast, fileError);
    if (existingAttachments.length - removed.length + files.length > 3) return showActionError(toast, "Keep up to three attachments in total.");
    form.set("removedAttachmentIds", JSON.stringify(removed));
    form.set("category", category);
    // Only internship feedback submits tags. Category changes cannot carry a hidden
    // department audience into platform, technical or general feedback.
    form.set("internshipIds", JSON.stringify(internship ? selected : []));
    files.forEach(file => form.append("attachments", file));
    setBusy(true);
    try {
      const result = await toastAndAction({
        action: editing ? updateFeedback : createFeedback, args: editing ? [initialData.post.id, form] : [form], loadingLabel: editing ? "Updating feedback..." : "Posting feedback...",
        successLabel: editing ? "Feedback updated." : "Feedback posted.", errorLabel: "Could not save feedback.", timeoutMs: 120000,
      });
      // Keep the draft/files available on returned failure or timeout. Only confirmed
      // success hands the saved ID/detail to the parent for cache reconciliation.
      if (result?.success) await onPosted(result.id, result.detail);
    } finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
      <FormDialogContent
        title={editing ? "Update Feedback" : "Create feedback or concern"}
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
        onInteractOutside={event => { if (busy) event.preventDefault(); }}
      >
        <ModalForm.Root onSubmit={submit}>
          <fieldset disabled={busy} className="min-w-0 space-y-5">
            <ModalForm.Section title="Feedback Details">
              <ModalForm.Field label="Category" as="div">
                <FeedbackSelect
                  id="feedback-category" value={category}
                  onValueChange={value => { setCategory(value); setSelected([]); }}
                  options={feedbackCategories} label="Category"
                />
              </ModalForm.Field>
              <ModalForm.Field label="Subject">
                <ModalForm.Input id="feedback-subject" name="subject" defaultValue={initialData?.post?.subject || ""} required maxLength={160} placeholder="What would you like to share?" />
              </ModalForm.Field>
              <ModalForm.Field label="Description">
                <ModalForm.Textarea id="feedback-description" name="description" defaultValue={initialData?.post?.description || ""} required maxLength={5000} rows={5} placeholder="Describe your feedback or concern..." />
              </ModalForm.Field>
            </ModalForm.Section>

            {internship && (
              <ModalForm.Section
                title="Related Internships"
                optional
                description="Tag supervised interns to include their department heads. Everyone in the audience can read the whole discussion."
              >
                <div aria-label="Related internships" className="min-w-0 space-y-3">
                  {query.isError && <ErrorUI error={query.error} reset={() => void query.refetch()} compact logError={false} />}
                  {query.isPending ? (
                    <SelectionRowsSkeleton label="Loading your interns" search />
                  ) : (
                    <>
                      <ModalForm.Input
                        value={search} onChange={event => setSearch(event.target.value)}
                        aria-label="Find a supervised intern" placeholder="Search name, company, or department"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span>{selected.length} tagged</span>
                        <Button
                          type="button" variant="ghost" size="sm"
                          disabled={interns.length > 200 || !interns.length}
                          onClick={() => setSelected(selected.length === interns.length ? [] : interns.map(i => i.id))}
                        >{selected.length === interns.length && selected.length ? "Clear tags" : "Select all my interns"}</Button>
                      </div>
                      {interns.length > 200 && <p className="text-xs text-muted-foreground">Select up to 200 internships per post.</p>}
                      <div className="max-h-44 overflow-y-auto overscroll-contain rounded-lg border border-border">
                        {visible.map(i => (
                          <label key={i.id} className="flex cursor-pointer items-start gap-3 border-b border-border p-3 last:border-0">
                            <input
                              type="checkbox" className="mt-1 accent-primary"
                              checked={selected.includes(i.id)}
                              disabled={!selected.includes(i.id) && selected.length >= 200}
                              onChange={event => setSelected(current => event.target.checked ? [...current, i.id] : current.filter(id => id !== i.id))}
                            />
                            <span className="min-w-0 text-sm">
                              <span className="block break-words font-medium">{i.student_name} <span className="text-xs text-primary-emphasis">{i.department_code}</span></span>
                              <span className="block break-words text-xs text-muted-foreground">{i.company_name} &middot; {i.internship_position}</span>
                            </span>
                          </label>
                        ))}
                        {!visible.length && <p className="p-3 text-sm text-muted-foreground">No matching supervised internships.</p>}
                      </div>
                    </>
                  )}
                </div>
              </ModalForm.Section>
            )}

            <ModalForm.Section title="Attachments" optional>
              {editing && existingAttachments.length > 0 && <div className="min-w-0 space-y-2">
                <FeedbackAttachments postId={initialData.post.id} attachments={existingAttachments.filter(attachment => !removed.includes(attachment.id))} />
                {existingAttachments.map(attachment => <label key={attachment.id} className="flex items-start gap-2 text-xs text-foreground-soft">
                  <input type="checkbox" checked={removed.includes(attachment.id)} onChange={event => setRemoved(current => event.target.checked ? [...current, attachment.id] : current.filter(id => id !== attachment.id))} />
                  <span className="min-w-0 break-all">Remove {attachment.filename}</span>
                </label>)}
              </div>}
              <ModalForm.Field label="Supporting Documents">
                <ModalForm.Input
                  id="feedback-files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={event => {
                    const next = Array.from(event.target.files || []);
                    const error = validateFeedbackFiles(next);
                    if (error) {
                      showActionError(toast, error);
                      event.target.value = "";
                      setFiles([]);
                    } else setFiles(next);
                  }}
                />
              </ModalForm.Field>
              <p className="text-xs leading-relaxed text-foreground-subtle">Up to 3 PDFs or images, 5 MB each.</p>
            </ModalForm.Section>

            <div aria-live="polite" className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-foreground-soft">
              <strong>Visible to:</strong> {feedbackAudience(category, departments)}. Students cannot access this discussion.
            </div>
          </fieldset>

          <ModalForm.Footer>
            <div className="flex min-w-0 w-full items-stretch justify-end gap-2">
              <Button type="button" variant="outline" className={modalFormCancelClass} disabled={busy} onClick={onClose}>Cancel</Button>
              <Button type="submit" className={modalFormPrimaryClass} disabled={busy || (internship && query.isPending)}>{busy ? "Saving..." : editing ? "Update" : "Post feedback"}</Button>
            </div>
          </ModalForm.Footer>
        </ModalForm.Root>
      </FormDialogContent>
    </Dialog>
  );
}
