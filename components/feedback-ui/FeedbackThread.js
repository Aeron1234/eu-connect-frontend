"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, LockKeyhole, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ErrorUI from "@/components/ui/ErrorUI";
import { feedbackDetailOptions, feedbackKeys, cacheEditedFeedback, removeCachedFeedback } from "@/lib/cache/feedback-queries";
import { postFeedbackReply, changeFeedbackStatus, getOlderFeedbackReplies } from "@/lib/server-actions/feedback-actions";
import { categoryLabel, statusLabel, feedbackStatuses, canManageFeedback, feedbackAudience } from "@/lib/feedback.mjs";
import { toastAndAction } from "@/lib/helpers";
import { showActionError } from "@/lib/toast-and-action.mjs";
import FeedbackSelect from "./FeedbackSelect";
import FeedbackAttachments from "./FeedbackAttachments";
import FeedbackComposer from "./FeedbackComposer";
import { FeedbackActionButtons, FeedbackDeleteDialog, FeedbackReplyEditor } from "./FeedbackAuthorActions";

export function feedbackTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
}
export default function FeedbackThread({ id, user, onBack, onDeleted = onBack }) {
  const queryClient = useQueryClient();
  const [deleted, setDeleted] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [deletingReply, setDeletingReply] = useState(null);
  const query = useQuery(feedbackDetailOptions(user.id, id, user.role));
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [olderBusy, setOlderBusy] = useState(false);
  const [older, setOlder] = useState({ version: null, replies: [], more: null });
  const staff = canManageFeedback(user.role);
  useEffect(() => {
    const old = document.body.style.overflow;
    // The mobile discussion owns scrolling; avoid a second page scrollbar.
    if (window.matchMedia("(max-width: 1023px)").matches) document.body.style.overflow = "hidden";
    const key = e => {
      if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector('[data-slot="dialog-content"]')) onBack();
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = old; document.removeEventListener("keydown", key); };
  }, [onBack]);
  async function refresh() { await queryClient.invalidateQueries({ queryKey: feedbackKeys.all(user.id) }); }
  async function reply(event) {
    event.preventDefault();
    if (busy) return;
    if (!text.trim()) return showActionError(toast, "Enter a reply.");
    setBusy(true);
    try {
      const result = await toastAndAction({ action: postFeedbackReply, args: [id, text, staff && internal], loadingLabel: "Sending reply...", successLabel: internal ? "Internal note added." : "Reply sent.", errorLabel: "Could not send reply.", timeoutMs: 35000 });
      if (result?.success) { setText(""); await refresh(); }
    } finally { setBusy(false); }
  }
  async function postEdited(postId, detail) {
    await cacheEditedFeedback(queryClient, { userId: user.id, role: user.role, id: postId, detail });
    setEditingPost(false);
    await refresh();
  }
  async function postDeleted() {
    setDeleted(true);
    await removeCachedFeedback(queryClient, user.id, id);
    await onDeleted();
    await refresh();
  }
  async function replyChanged(result) {
    await queryClient.cancelQueries({ queryKey: feedbackKeys.all(user.id) });
    queryClient.setQueryData(feedbackKeys.detail(user.id, id, user.role), previous => {
      if (!previous?.post) return previous;
      return { ...previous, post: { ...previous.post, reply_version: result.replyVersion },
        replies: previous.replies.filter(reply => reply.id !== result.deletedReplyId)
          .map(reply => reply.id === result.reply?.id ? { ...reply, ...result.reply } : reply) };
    });
    setEditingReply(null); setDeletingReply(null);
    await refresh();
  }
  async function changeStatus(value) {
    if (statusBusy) return;
    setStatusBusy(true);
    try {
      const result = await toastAndAction({ action: changeFeedbackStatus, args: [id, value], loadingLabel: "Updating status...", successLabel: "Status updated.", errorLabel: "Could not update status.", timeoutMs: 35000 });
      if (result?.success) await refresh();
    } finally { setStatusBusy(false); }
  }
  async function loadOlder() {
    if (olderBusy) return;
    setOlderBusy(true);
    try {
      const version = query.data?.post?.reply_version;
      const current = older.version === version ? older.replies : [];
      const before = current[0]?.id || query.data?.replies?.[0]?.id;
      const result = await getOlderFeedbackReplies(id, before);
      if (!result?.success) return showActionError(toast, result?.error || "Could not load earlier replies.");
      if (result.replyVersion !== undefined && result.replyVersion !== version) return refresh();
      setOlder(previous => ({ version, replies: [...result.replies, ...(previous.version === version ? previous.replies : [])], more: result.moreReplies }));
    } finally { setOlderBusy(false); }
  }
  const data = query.data;
  const accessDenied = [401, 403, 404].includes(query.error?.status);
  const post = accessDenied || deleted ? null : data?.post;
  const existing = new Set((data?.replies || []).map(r => r.id));
  const oldReplies = older.version === post?.reply_version ? older.replies : [];
  const replies = [...oldReplies.filter(r => !existing.has(r.id)), ...(data?.replies || [])];
  const isAuthor = post?.author_id === user.id;
  const departments = [...new Set((data?.mentions || []).map(m => m.department_code || m.department_name))];
  return <section aria-label="Feedback discussion" className="fixed inset-0 z-40 flex min-h-0 min-w-0 flex-col overflow-hidden bg-card lg:static lg:z-auto lg:h-full lg:rounded-xl lg:border lg:border-border">
    <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3 sm:px-5">
      <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back to feedback feed"><ArrowLeft className="size-4" /></Button>
      <h2 className="min-w-0 flex-1 text-sm font-semibold">Discussion</h2>
      <span className="flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3" />Private</span>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
      {query.isError && <ErrorUI error={query.error} reset={() => void query.refetch()} compact logError={false} />}
      {query.isPending && <p role="status" className="text-sm text-muted-foreground">Loading discussion...</p>}
      {post && <>
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-medium text-primary-emphasis">{categoryLabel(post.category)}</span>
          {staff ? <div className="w-36"><FeedbackSelect value={post.status} onValueChange={changeStatus} options={feedbackStatuses} label="Discussion status" disabled={statusBusy} /></div> : <span className="rounded-full bg-muted px-2 py-1 text-xs">{statusLabel(post.status)}</span>}
        </div>
        <div className="mt-3 flex items-start justify-between gap-2"><h3 className="min-w-0 break-words text-lg font-semibold">{post.subject}</h3>{isAuthor && <FeedbackActionButtons label="feedback" onEdit={() => setEditingPost(true)} onDelete={() => setDeletingPost(true)} />}</div>
        <p className="mt-1 break-words text-xs text-muted-foreground">{post.author_name || "Employer"} &middot; {feedbackTime(post.created_at)}</p>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{post.description}</p>
        {!!data.mentions.length && <div className="mt-4 flex flex-wrap gap-2" aria-label="Tagged interns">{data.mentions.map(m => <span key={m.internship_id} title={m.company_name} className="max-w-full break-words rounded-md bg-primary/10 px-2 py-1 text-xs text-primary-emphasis">{m.student_name} &middot; {m.department_code}</span>)}</div>}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Audience: {feedbackAudience(post.category, departments, "author")}. Students cannot view this discussion.</p>
        <FeedbackAttachments postId={id} attachments={data.attachments} />
        <div className="mt-6 border-t border-border pt-4"><h4 className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="size-4" />Replies</h4></div>
        {(older.version === post.reply_version ? older.more ?? data.moreReplies : data.moreReplies) && <Button type="button" variant="ghost" className="mt-3 w-full" disabled={olderBusy} onClick={loadOlder}>{olderBusy ? "Loading..." : "Load earlier replies"}</Button>}
        <div className="mt-4 space-y-3">
          {replies.map(r => <article key={r.id} className={"min-w-0 rounded-lg p-3 " + (r.is_internal ? "border border-amber-500/30 bg-amber-500/10" : "bg-muted")}>
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs"><span className="font-medium">{r.author_name || "Staff"}{r.is_internal ? " | Internal note" : ""}</span><time className="text-muted-foreground">{feedbackTime(r.created_at)}</time></div>
            <div className="mt-2 flex items-start justify-between gap-2"><p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed">{r.body}</p>{r.author_id === user.id && <FeedbackActionButtons label="reply" onEdit={() => setEditingReply(r)} onDelete={() => setDeletingReply(r)} />}</div>
          </article>)}
          {!replies.length && <p className="text-sm text-muted-foreground">No replies yet.</p>}
        </div>
      </>}
    </div>
    {post && <form onSubmit={reply} className="shrink-0 space-y-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      {post.status === "resolved" ? <p className="text-sm text-muted-foreground">Resolved. School staff can reopen this discussion.</p> : <>
        {staff && <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={internal} disabled={busy} onChange={e => setInternal(e.target.checked)} />Internal note - school staff only</label>}
        <label htmlFor="feedback-reply" className="sr-only">Reply</label>
        <textarea id="feedback-reply" value={text} onChange={e => setText(e.target.value)} maxLength={5000} rows={3} disabled={busy} placeholder={internal ? "Add a private staff note..." : "Write a reply..."} className="max-h-40 w-full min-w-0 resize-y rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-muted-foreground">{internal ? "Hidden from the employer" : "Visible to the discussion audience"}</span><Button type="submit" size="sm" disabled={busy}><Send className="mr-1 size-3.5" />{busy ? "Sending..." : "Send"}</Button></div>
      </>}
    </form>}
    {editingPost && post && <FeedbackComposer userId={user.id} initialData={data} onClose={() => setEditingPost(false)} onPosted={postEdited} />}
    {deletingPost && <FeedbackDeleteDialog postId={id} onClose={() => setDeletingPost(false)} onDone={postDeleted} />}
    {editingReply && <FeedbackReplyEditor postId={id} reply={editingReply} onClose={() => setEditingReply(null)} onDone={replyChanged} />}
    {deletingReply && <FeedbackDeleteDialog postId={id} reply={deletingReply} onClose={() => setDeletingReply(null)} onDone={replyChanged} />}
  </section>;
}
