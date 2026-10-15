import { Megaphone } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementGroups({
  isPinnedExist,
  visiblePinned,
  filteredRegular,
  focusedAnnouncementId,
  targetRef,
  highlightTarget,
  categories,
  refreshList,
}) {
  return (
    <div className="space-y-6">
      {isPinnedExist && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-emphasis">
            Pinned
          </p>
          <ul className="flex flex-col gap-3">
            {visiblePinned.map((announcement) => (
              <li
                key={`pinned-${announcement.id}`}
                ref={announcement.id === focusedAnnouncementId ? targetRef : null}
                className="scroll-mt-24"
              >
                <AnnouncementCard
                  announcement={announcement}
                  categories={categories}
                  onChanged={refreshList}
                  highlighted={announcement.id === focusedAnnouncementId && highlightTarget}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {filteredRegular.length > 0 ? (
        <div>
          {isPinnedExist && (
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
              Earlier
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {filteredRegular.map((announcement) => (
              <li
                key={`reg-${announcement.id}`}
                ref={announcement.id === focusedAnnouncementId ? targetRef : null}
                className="scroll-mt-24"
              >
                <AnnouncementCard
                  announcement={announcement}
                  categories={categories}
                  onChanged={refreshList}
                  highlighted={announcement.id === focusedAnnouncementId && highlightTarget}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !isPinnedExist && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card border-border py-16 text-center">
            <Megaphone className="size-8 text-foreground-faint" />
            <p className="text-sm text-muted-foreground">
              No announcements found.
            </p>
          </div>
        )
      )}
    </div>
  );
}
