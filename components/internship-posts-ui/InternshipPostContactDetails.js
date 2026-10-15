import { format } from "date-fns";
import { Globe, Mail, Phone } from "lucide-react";

export default function InternshipPostContactDetails({ item }) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="text-xs font-semibold text-muted-foreground">
        Contact Details:
      </p>
      <div className="mt-2 flex flex-col items-start gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
        <span className="font-medium text-foreground">
          {item.contact_name}
        </span>
        <a
          href={`mailto:${item.contact_email}`}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-emphasis transition-colors"
        >
          <Mail className="h-3.5 w-3.5" /> {item.contact_email}
        </a>
        <a
          href={`tel:${item.contact_phone.replace(/[^\d+]/g, "")}`}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-emphasis transition-colors"
        >
          <Phone className="h-3.5 w-3.5" /> {item.contact_phone}
        </a>

        <a
          href={`https://${item.contact_website}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-emphasis transition-colors"
        >
          <Globe className="h-3.5 w-3.5" /> {item.contact_website}
        </a>

        <span className="self-end shrink-0 text-xs text-muted-foreground sm:ml-auto sm:self-auto">
          Posted {format(new Date(item.created_at), "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
}
