import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";

export default function HelpGuideCard({ guide, accountHref }) {
  const href = guide.href ?? accountHref;

  return (
    <details className="group rounded-xl border border-border bg-card transition-colors open:border-primary-emphasis/40">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{guide.title}</span>
          <span className="mt-1 block text-sm text-foreground-soft">{guide.summary}</span>
        </span>
        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-foreground-soft transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground-soft">
          {guide.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-emphasis hover:underline">
          {guide.linkText} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </details>
  );
}
