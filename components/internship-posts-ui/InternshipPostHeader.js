import InternshipPostActions from "./InternshipPostActions";

function companyNameInitials(companyName) {
  const splitted = companyName.split(" ");
  let initials = splitted.map((s) => s.charAt(0)).join("");

  return initials.length < 2
    ? initials.toLocaleUpperCase()
    : initials.slice(0, 3).toLocaleUpperCase();
}

export default function InternshipPostHeader({ item, courses, actions }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3 sm:gap-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-emphasis text-xs font-bold">
          {companyNameInitials(item.company_name)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold sm:font-bold text-foreground">
              {item.position}
            </h2>
            {item.isOwner && (
              <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">
                My Post
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {item.company_name}
          </p>
        </div>
      </div>

      <InternshipPostActions item={item} courses={courses} {...actions} />
    </div>
  );
}
