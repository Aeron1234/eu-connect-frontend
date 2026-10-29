"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { getHelpAdminContacts } from "@/lib/server-actions/help-actions";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";

export default function AdminSupportContacts({ viewerId }) {
  const query = useQuery({
    queryKey: ["help-admin-contacts", String(viewerId)], enabled: Boolean(viewerId),
    queryFn: async () => {
      const result = await getHelpAdminContacts();
      if (result?.error || result?.success !== true || !Array.isArray(result.contacts)) {
        throw Object.assign(new Error(result?.error || "Could not load administrator contacts."), { status: result?.status || 0 });
      }
      return result.contacts;
    },
    staleTime: 30000, gcTime: 300000, retry: false, refetchOnMount: "always",
  });
  if (query.isPending) return <div role="status" aria-label="Loading administrator contacts" className="mt-4 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-60 max-w-full" /></div>;
  const contacts = [401, 403].includes(query.error?.status) ? undefined : query.data;
  return <div className="mt-4 space-y-3">
    {query.isError && <ErrorUI compact error={query.error} reset={() => void query.refetch()} logError={false} />}
    {contacts?.length === 0 && <p className="text-sm text-foreground-soft">No administrator email or phone number is available yet. Ask your department office for the school&apos;s support contact.</p>}
    {contacts?.length > 0 && <ul aria-label="Administrator support contacts" className="grid min-w-0 gap-3 sm:grid-cols-2">{contacts.map((contact, index) => <li key={index} className="min-w-0 rounded-lg border border-border p-3">
      <p className="break-words text-sm font-semibold text-foreground">{contact.name}</p>
      {contact.email && <a href={`mailto:${encodeURIComponent(contact.email)}`} className="mt-2 flex min-h-9 items-start gap-2 text-sm text-primary-emphasis hover:underline"><Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span className="break-all">{contact.email}</span></a>}
      {contact.contact_number && <a href={`tel:${contact.contact_number.replace(/[^\d+]/g, "")}`} className="mt-1 flex min-h-9 items-start gap-2 text-sm text-primary-emphasis hover:underline"><Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span className="break-words">{contact.contact_number}</span></a>}
    </li>)}</ul>}
  </div>;
}
