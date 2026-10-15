"use client";

import useInternshipPostActions from "./useInternshipPostActions";
import InternshipPostHeader from "./InternshipPostHeader";
import InternshipPostBadges from "./InternshipPostBadges";
import InternshipPostDetails from "./InternshipPostDetails";
import InternshipPostContactDetails from "./InternshipPostContactDetails";

export default function InternshipPostsList(props) {
  const { item, userRole, courses } = props;
  const actions = useInternshipPostActions(props);

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <InternshipPostHeader item={item} courses={courses} actions={actions} />
      <InternshipPostBadges
        item={item}
        userRole={userRole}
        isFavorited={actions.isFavorited}
        toggleFavorite={actions.toggleFavorite}
      />
      <InternshipPostDetails item={item} />
      <InternshipPostContactDetails item={item} />
    </article>
  );
}
