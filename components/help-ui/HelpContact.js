import { Mail, Phone } from "lucide-react";

export default function HelpContact() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="font-semibold">Still need help?</h2>
      <p className="mt-1 text-sm text-foreground-soft">For account access or a record that looks incorrect, contact the EU-Connect administrator. Include the page name and a brief description of the issue.</p>
      <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
        <a href="mailto:admin@example.com" className="inline-flex items-center gap-2 font-medium text-primary-emphasis hover:underline">
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          admin@example.com
        </a>
        <a href="tel:+639000000000" className="inline-flex items-center gap-2 font-medium text-primary-emphasis hover:underline">
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          +63 900 000 0000
        </a>
      </div>
      <p className="mt-3 text-xs text-foreground-soft">Sample contact details. Replace these with the administrator&apos;s actual email and number before use.</p>
    </section>
  );
}
