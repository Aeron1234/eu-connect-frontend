"use client";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import ConfirmationContent from "@/components/ui/ConfirmationContent";
import FormDialogContent from "@/components/ui/FormDialogContent";
import ModalForm from "@/components/ui/ModalForm";
import { Button } from "@/components/ui/button";
import { modalFormCancelClass, modalFormPrimaryClass } from "@/components/ui/modalFormStyles";
import { toastAndAction } from "@/lib/helpers";
import { showActionError } from "@/lib/toast-and-action.mjs";
import { deleteFeedback, updateFeedbackReply, deleteFeedbackReply } from "@/lib/server-actions/feedback-actions";

export function FeedbackActionButtons({ label, onEdit, onDelete }) {
  return <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
    <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={"Edit " + label} onClick={onEdit}><Pencil className="size-4" /></Button>
    <Button type="button" variant="ghost" size="icon" className="size-8 hover:text-destructive" aria-label={"Delete " + label} onClick={onDelete}><Trash2 className="size-4" /></Button>
  </div>;
}
export function FeedbackDeleteDialog({ postId, reply = null, onClose, onDone }) {
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true);
    try {
      const result = await toastAndAction({ action: reply ? deleteFeedbackReply : deleteFeedback, args: reply ? [postId, reply.id] : [postId],
        loadingLabel: "Deleting...", successLabel: reply ? "Reply deleted." : "Feedback deleted.", errorLabel: "Could not delete.", timeoutMs: 45000 });
      if (result?.success) { await onDone(result); onClose(); }
    } finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <ConfirmationContent title={reply ? "Delete Reply" : "Delete Feedback"} description={reply ? "Delete your reply permanently?" : "Delete this feedback, its replies, and all attached files permanently?"} showCloseButton={!busy}>
      <ModalForm.Root onSubmit={submit}>
        <div className="flex w-full justify-center gap-2">
          <Button type="button" variant="outline" className={modalFormCancelClass} disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="submit" className={modalFormPrimaryClass} disabled={busy}>{busy ? "Deleting..." : "Delete"}</Button>
        </div>
      </ModalForm.Root>
    </ConfirmationContent>
  </Dialog>;
}
export function FeedbackReplyEditor({ postId, reply, onClose, onDone }) {
  const [text, setText] = useState(reply.body);
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    if (!text.trim()) return showActionError(toast, "Enter a reply.");
    setBusy(true);
    try {
      const result = await toastAndAction({ action: updateFeedbackReply, args: [postId, reply.id, text], loadingLabel: "Updating reply...", successLabel: "Reply updated.", errorLabel: "Could not update reply.", timeoutMs: 35000 });
      if (result?.success) { await onDone(result); onClose(); }
    } finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <FormDialogContent title={reply.is_internal ? "Update Internal Note" : "Update Reply"} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onInteractOutside={event => { if (busy) event.preventDefault(); }}>
      <ModalForm.Root onSubmit={submit}>
        <ModalForm.Field label="Reply"><ModalForm.Textarea value={text} onChange={event => setText(event.target.value)} required maxLength={5000} disabled={busy} /></ModalForm.Field>
        <ModalForm.Footer><div className="flex w-full justify-end gap-2"><Button type="button" variant="outline" className={modalFormCancelClass} disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" className={modalFormPrimaryClass} disabled={busy}>{busy ? "Updating..." : "Update"}</Button></div></ModalForm.Footer>
      </ModalForm.Root>
    </FormDialogContent>
  </Dialog>;
}
