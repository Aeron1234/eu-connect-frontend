import ErrorUI from "@/components/ui/ErrorUI";

export default function SelectedAnnouncement({ targetId, targetQuery }) {
  // Successful links are rendered only inside their normal feed group.
  if (!targetId || !targetQuery.isError) return null;

  return (
    <section aria-label="Selected announcement" className="space-y-3">
      {![403, 404].includes(targetQuery.error?.status) ? (
        <ErrorUI error={targetQuery.error} reset={() => void targetQuery.refetch()} logError={false} />
      ) : (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          This announcement is unavailable or you do not have access to it.
        </p>
      )}
    </section>
  );
}
