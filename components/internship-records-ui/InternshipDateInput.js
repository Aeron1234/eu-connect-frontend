"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Popover } from "radix-ui";
import { Calendar } from "@/components/ui/calendar";
import { inputClass, labelClass } from "./internshipFormStyles";
import { formatInternshipInputDate, maskInternshipInputDate, parseInternshipInputDate } from "./internshipDateInput.mjs";

export default function InternshipDateInput({ name, label, value = "", onChange, disabled = false, min = "" }) {
  const [draft, setDraft] = useState(null);
  const [open, setOpen] = useState(false);
  // A parent reset/cancel takes precedence over an unrelated partial draft.
  const text = !disabled && draft?.value === value ? draft.text : formatInternshipInputDate(value);
  const parsed = parseInternshipInputDate(text);
  const error = text && !parsed ? "Enter a valid date in MM/dd/yyyy format."
    : parsed && min && parsed < min ? "The estimated end date cannot be before the start date." : "";
  const selected = parsed ? parseISO(parsed) : undefined;

  function changeText(event) {
    const next = maskInternshipInputDate(event.target.value);
    const iso = parseInternshipInputDate(next);
    setDraft({ text: next, value: iso });
    onChange(iso);
  }

  return <div className="min-w-0">
    <label htmlFor={name} className={labelClass}>{label}</label>
    <div className="relative">
      <input id={name} type="text" inputMode="numeric" autoComplete="off" placeholder="MM/dd/yyyy" maxLength={10}
        className={`${inputClass} pr-12`} value={text} onChange={changeText} required disabled={disabled}
        aria-describedby={`${name}-format`} ref={element => { element?.setCustomValidity(error); }} />
      <input type="hidden" name={name} value={parsed} disabled={disabled} />
      <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button type="button" disabled={disabled} aria-label={`Choose ${label.replace(/\s*\*$/, "").toLowerCase()}`} className="absolute right-1 top-1 grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50">
            <CalendarDays className="size-4" aria-hidden="true" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="end" sideOffset={6} className="z-50 max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-lg" aria-label={`${label.replace(/\s*\*$/, "")} calendar`}>
            <Calendar mode="single" selected={selected} defaultMonth={selected} disabled={min ? { before: parseISO(min) } : undefined}
              onSelect={date => { if (!date) return; setDraft(null); onChange(format(date, "yyyy-MM-dd")); setOpen(false); }} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
    <p id={`${name}-format`} className="mt-1.5 text-xs text-muted-foreground">MM/dd/yyyy</p>
  </div>;
}
