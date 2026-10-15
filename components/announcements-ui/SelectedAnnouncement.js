import ErrorUI from "@/components/ui/ErrorUI";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementCardSkeleton from "../skeletons/AnnouncementCardSkeleton";

export default function SelectedAnnouncement({
  targetId,
  targetQuery,
  targetAnnouncement,
  targetRef,
  highlightTarget,
  categories,
  refreshList,
}) {
  return (
    targetId && (
      <section aria-label="Selected announcement" className="space-y-3">
        {targetQuery.isPending ? (
          <AnnouncementCardSkeleton showEventDate />
        ) : targetQuery.isError && ![403, 404].includes(targetQuery.error?.status) ? (
          <ErrorUI error={targetQuery.error} reset={() => void targetQuery.refetch()} logError={false} />
        ) : targetQuery.isError ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            This announcement is unavailable or you do not have access to it.
          </p>
        ) : (
          <div ref={targetRef} className="scroll-mt-6">
            <AnnouncementCard
              announcement={targetAnnouncement}
              categories={categories}
              onChanged={refreshList}
              highlighted={highlightTarget}
            />
          </div>
        )}
      </section>
    )
  );
}
