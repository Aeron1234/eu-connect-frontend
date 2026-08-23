"use client";

import { User } from "lucide-react";
import { CARD_ICONS, displayValue } from "./accountHelpers";

export default function InfoCard({
  card,
  cardIndex,
  isEditing,
  onFieldChange,
}) {
  const Icon = CARD_ICONS[card.title] ?? User;

  return (
    <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
        <Icon className="h-4 w-4" /> {card.title}
      </h3>
      <dl className="mt-5 space-y-4">
        {card.fields.map((f, fieldIndex) => (
          <div key={f.label}>
            <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {f.label}
            </dt>
            {isEditing && f.editable ? (
              <input
                type="text"
                value={f.value}
                onChange={(e) =>
                  onFieldChange(cardIndex, fieldIndex, e.target.value)
                }
                className="mt-1 w-full text-sm text-foreground rounded-md border border-border bg-background px-2 py-1.5"
              />
            ) : (
              <dd className="mt-1 text-sm text-foreground">
                {displayValue(f.value)}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
