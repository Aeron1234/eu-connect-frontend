"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, LockKeyhole, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";
import HelpManual from "@/components/help-ui/HelpManual";
import { socket } from "@/components/ui/SocketProvider";
import { feedbackListOptions, feedbackKeys, cacheCreatedFeedback } from "@/lib/cache/feedback-queries";
import { feedbackCategories, feedbackStatuses, categoryLabel, statusLabel } from "@/lib/feedback.mjs";
import FeedbackComposer from "./FeedbackComposer";
import DropdownFilter from "@/components/ui/DropdownFilter";
import SearchBar from "@/components/ui/SearchBar";
import FeedbackThread, { feedbackTime } from "./FeedbackThread";

export default function FeedbackBoard() {
  const { user } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const selected = params.get("post");
  const [compose, setCompose] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "all", status: "all", page: 1, search: "" });
  const queryClient = useQueryClient();
  const query = useQuery({ ...feedbackListOptions(user?.id, filters, user?.role), enabled: Boolean(user?.id) });
  useEffect(() => {
    const timer = setTimeout(() => setFilters(current => ({ ...current, search, page: 1 })), 350);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (!user?.id) return;
    const refresh = () => void queryClient.invalidateQueries({ queryKey: feedbackKeys.all(user.id) });
    // Socket events invalidate only this viewer's feedback queries. Local mutations
    // also reconcile explicitly, so new posts do not depend on socket delivery.
    socket.on("feedback_updated", refresh);
    socket.on("connect", refresh);
    return () => { socket.off("feedback_updated", refresh); socket.off("connect", refresh); };
  }, [user?.id, queryClient]);
  const select = useCallback(id => router.push(id ? "/feedback?post=" + encodeURIComponent(id) : "/feedback", { scroll: false }), [router]);
  const back = useCallback(() => select(null), [select]);
  async function handlePosted(id, detail) {
    // Posting from an old page or incompatible filter must still reveal the new post.
    const freshFilters = { category: "all", status: "all", page: 1, search: "" };
    try {
      await cacheCreatedFeedback(queryClient, { userId: user.id, role: user.role, id, detail });
    } catch {
      // The write is already confirmed. Leave the discussion available for the
      // normal read/retry flow rather than making the author submit it again.
      await queryClient.invalidateQueries({ queryKey: feedbackKeys.all(user.id), refetchType: "none" });
    } finally {
      setSearch("");
      setFilters(freshFilters);
      setCompose(false);
      select(id);
    }
    // Read after the write, independently of socket delivery. Cached content stays
    // visible if this background confirmation fails; the normal retry UI remains.
    await queryClient.fetchQuery({ ...feedbackListOptions(user.id, freshFilters, user.role), staleTime: 0 }).catch(() => {});
  }
  if (!user) return null;
  // Hide cached private rows after an authorization failure; transport refresh
  // errors may keep previously loaded content alongside retry feedback.
  const posts = [401, 403].includes(query.error?.status) ? [] : query.data?.posts || [];
  const page = query.data?.page || filters.page;
  const pages = query.data?.totalPages || 1;
  return <div className="min-w-0 space-y-4 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><div className="flex items-start gap-1"><h1 className="flex min-w-0 items-center gap-2 text-xl font-bold sm:text-2xl"><MessageSquare className="size-5 shrink-0 text-primary-emphasis" />Feedback &amp; Concerns</h1><HelpManual guideId="feedback" title="How to use Feedback & Concerns" /></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">Private discussions between employers and the relevant school staff.</p></div>
      {user.role === "employer" && <Button onClick={() => setCompose(true)} className="w-full sm:w-auto"><Plus className="mr-1 size-4" />Create feedback</Button>}
    </div>
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:h-[calc(100dvh-13rem)] lg:min-h-[32rem] lg:grid-cols-[minmax(17rem,0.85fr)_minmax(0,1.3fr)]">
      <section aria-label="Feedback feed" className={(selected ? "hidden lg:flex " : "flex ") + "min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card"}>
        <div className="shrink-0 space-y-3 border-b border-border p-3 sm:p-4">
          <div className="min-w-0 [&_input]:md:w-full">
            <SearchBar ariaLabel="Search feedback" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search feedback..." position="right" />
          </div>
          <div className="flex min-w-0 gap-2">
            <DropdownFilter
              value={filters.category} onValueChange={category => setFilters(current => ({ ...current, category, page: 1 }))}
              options={[{ value: "all", label: "Category" }, ...feedbackCategories]} placeholder="Category"
              className="h-10 min-w-0 flex-1 overflow-hidden rounded-md bg-card p-2 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
              itemClassName="whitespace-normal break-words text-xs"
            />
            <DropdownFilter
              value={filters.status} onValueChange={status => setFilters(current => ({ ...current, status, page: 1 }))}
              options={[{ value: "all", label: "Status" }, ...feedbackStatuses]} placeholder="Status"
              className="h-10 min-w-0 flex-1 overflow-hidden rounded-md bg-card p-2 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
              itemClassName="whitespace-normal break-words text-xs"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={query.isFetching}>
          {query.isError && <div className="p-3"><ErrorUI error={query.error} reset={() => void query.refetch()} compact logError={false} /></div>}
          {query.isPending && <FeedbackFeedSkeleton />}
          {posts.map(post => <button type="button" key={post.id} onClick={() => select(post.id)} aria-pressed={selected === post.id} className={"block w-full min-w-0 border-b border-border p-4 text-left transition-colors hover:bg-muted " + (selected === post.id ? "bg-primary/5" : "")}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]"><span className="font-medium text-primary-emphasis">{categoryLabel(post.category)}</span><span className="rounded-full bg-secondary px-2 py-0.5">{statusLabel(post.status)}</span></div>
            <h2 className="mt-2 break-words text-sm font-semibold">{post.subject}</h2>
            <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{post.description}</p>
            {!!post.mentions?.length && <div className="mt-2 flex flex-wrap gap-1">{post.mentions.slice(0, 3).map((m, index) => <span key={index} className="max-w-full truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary-emphasis">{m.student_name} ({m.department_code})</span>)}{post.mentions.length > 3 && <span className="text-[10px] text-muted-foreground">+{post.mentions.length - 3} more</span>}</div>}
            <p className="mt-2 text-[11px] text-muted-foreground">{Number(post.reply_count || 0)} replies{Number(post.attachment_count) > 0 ? " | " + post.attachment_count + " attachments" : ""}</p>
            <p className="mt-3 break-words text-[11px] text-muted-foreground">{post.author_name || "Employer"} &middot; {feedbackTime(post.created_at)}</p>
          </button>)}
          {!query.isPending && !query.isError && !posts.length && <div className="p-8 text-center"><MessageSquare className="mx-auto mb-3 size-7 text-muted-foreground" /><p className="text-sm font-medium">No feedback found</p><p className="mt-1 text-xs text-muted-foreground">{user.role === "employer" ? "Share feedback or adjust your filters." : "Discussions shared with you will appear here."}</p></div>}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border p-3 text-xs"><span>Page {page} / {pages}</span><div className="flex gap-1"><Button size="icon-sm" variant="ghost" aria-label="Previous feedback page" disabled={query.isFetching || page <= 1} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}><ChevronLeft className="size-4" aria-hidden="true" /></Button><Button size="icon-sm" variant="ghost" aria-label="Next feedback page" disabled={query.isFetching || page >= pages} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}><ChevronRight className="size-4" aria-hidden="true" /></Button></div></div>
      </section>
      {selected ? <FeedbackThread key={user.id + ":" + selected} id={selected} user={user} onBack={back} onDeleted={() => { setFilters(current => ({ ...current, page: 1 })); back(); }} /> : <div className="hidden items-center justify-center rounded-xl border border-dashed border-border p-8 text-center lg:flex"><div><LockKeyhole className="mx-auto mb-3 size-8 text-muted-foreground" /><h2 className="font-semibold">Select a discussion</h2><p className="mt-2 max-w-xs text-sm text-muted-foreground">Read feedback, review tagged interns, and reply in one place.</p></div></div>}
    </div>
    {compose && user.role === "employer" && <FeedbackComposer userId={user.id} onClose={() => setCompose(false)} onPosted={handlePosted} />}
  </div>;
}
export function FeedbackFeedSkeleton() {
  return <div role="status" aria-label="Loading feedback" className="space-y-3 p-4">{[1,2,3,4].map(i => <div key={i} className="space-y-3 border-b border-border pb-4"><Skeleton className="h-3 w-24" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" /></div>)}</div>;
}
