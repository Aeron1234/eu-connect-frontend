// A linked announcement stays in the server's feed order, including its
// pinned group. Later pages can repeat rows after a refresh or pin change.
export function getAnnouncementFeed(pages = [], targetId = null) {
  const pinned = pages[0]?.pinned ?? [];
  // Seed deduplication with page-one pins, then retain each regular row's first
  // occurrence. A deep-link target is detected without inserting a duplicate card.
  const seen = new Set(pinned.map((announcement) => String(announcement.id)));
  const regular = pages.flatMap((page) =>
    page.regular.filter((announcement) => {
      const id = String(announcement.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }),
  );

  return {
    pinned,
    regular,
    hasTarget: targetId != null && seen.has(String(targetId)),
  };
}
