import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function HelpGuideCard({ guide, accountHref }) {
  const href = guide.href ?? accountHref;

  return (
    <Modal title={guide.title} description={guide.summary}
      triggerStyles="flex h-full w-full items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary-emphasis/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-5"
      trigger={<>
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{guide.title}</span>
          <span className="mt-1 block text-sm text-foreground-soft">{guide.summary}</span>
        </span>
        <BookOpen className="mt-0.5 size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
      </>}
    >
      <div className="min-w-0 break-words">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground-soft">
          {guide.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-emphasis hover:underline">
          {guide.linkText} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Modal>
  );
}
