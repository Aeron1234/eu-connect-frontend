import GuideCard from "./HelpGuideCard";

export default function HelpGuideSections({ visibleSections, accountHref }) {
  return (
    visibleSections.length ? visibleSections.map((section) => (
      <section key={section.title} className="space-y-3">
        <h2 className="text-base font-bold text-foreground sm:text-lg">{section.title}</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {section.guides.map((guide) => <GuideCard key={guide.title} guide={guide} accountHref={accountHref} />)}
        </div>
      </section>
    )) : (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="font-semibold">No matching guides</h2>
        <p className="mt-1 text-sm text-foreground-soft">Try a different task or shorter search term.</p>
      </div>
    )
  );
}
