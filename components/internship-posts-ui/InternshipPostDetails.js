import { Clock, MapPin } from "lucide-react";

export default function InternshipPostDetails({ item }) {
  return (
    <>
      <p className="mt-4 text-sm text-foreground">{item.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {item.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {item.duration_hours} hours
        </span>
        {item.courses.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-foreground-soft">Course:</span>
            {item.courses.map((c) => (
              <span
                key={c.id}
                className="rounded-md bg-muted px-2 py-0.5 text-foreground"
              >
                {c.shortName}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-foreground-soft">
          Requirements:
        </p>
        <ul className="mt-2 space-y-1.5">
          {item.requirements.split("\n").map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-stone-400" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
