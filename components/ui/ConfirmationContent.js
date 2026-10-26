"use client";

import { createContext, useContext, useId } from "react";
import { CheckCircle2, Coffee, LogIn, LogOut, Play, RotateCcw, TriangleAlert, XCircle } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const ConfirmationContext = createContext(null);

const successIconClass = "bg-emerald-100 text-emerald-700 ring-emerald-500/10 dark:bg-emerald-500/15 dark:text-emerald-300";
const infoIconClass = "bg-sky-100 text-sky-700 ring-sky-500/10 dark:bg-sky-500/15 dark:text-sky-300";
const reviewIconClass = "bg-amber-100 text-amber-700 ring-amber-500/10 dark:bg-amber-500/15 dark:text-amber-300";
const confirmationVisuals = {
  warning: { Icon: TriangleAlert, className: "bg-primary text-primary-foreground ring-primary/10" },
  "clock-in": { Icon: LogIn, className: successIconClass },
  "clock-out": { Icon: LogOut, className: infoIconClass },
  break: { Icon: Coffee, className: reviewIconClass },
  resume: { Icon: Play, className: successIconClass },
  approve: { Icon: CheckCircle2, className: successIconClass },
  decline: { Icon: XCircle, className: reviewIconClass },
  restore: { Icon: RotateCcw, className: infoIconClass },
  complete: { Icon: CheckCircle2, className: successIconClass },
};

export const confirmationActionGroupClass =
  "mx-auto flex w-full max-w-xs items-stretch justify-center gap-2.5";
export const confirmationButtonClass =
  "h-auto min-h-9 min-w-0 flex-1 whitespace-normal rounded-lg px-3 py-2 text-xs font-medium leading-tight sm:min-h-10 sm:px-4 sm:text-sm";
export const confirmationPrimaryClass =
  confirmationButtonClass + " bg-primary text-primary-foreground shadow-sm hover:bg-primary/90";
export const confirmationCancelClass =
  confirmationButtonClass + " border-border bg-card text-foreground-soft hover:bg-muted hover:text-foreground";

// Read the surrounding confirmation's description ID for nested form accessibility.
// Returns null outside ConfirmationContent; consumers should allow that standalone case.
export function useConfirmationLayout() {
  return useContext(ConfirmationContext);
}

export default function ConfirmationContent({
  title,
  description,
  children,
  showCloseButton = true,
  formDescription = false,
  intent = "warning",
}) {
  const descriptionId = useId();
  const { Icon, className: iconClassName } = confirmationVisuals[intent] ?? confirmationVisuals.warning;

  return (
    <ConfirmationContext.Provider value={{ descriptionId: description ? undefined : descriptionId }}>
      <DialogContent
        showCloseButton={showCloseButton}
        aria-describedby={description || formDescription ? descriptionId : undefined}
        className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl border-border bg-card p-5 shadow-xl sm:max-w-sm sm:gap-5 sm:p-6"
      >
        <DialogHeader className="items-center gap-3 text-center sm:text-center">
          <div className={`mb-1 mt-2 flex size-12 items-center justify-center rounded-full ring-4 ${iconClassName}`} aria-hidden="true">
            <Icon className="size-6" />
          </div>
          <DialogTitle className="w-full break-words text-center text-base font-semibold leading-snug text-foreground sm:text-lg [&_span]:text-inherit">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription id={descriptionId} className="w-full break-words text-center text-xs leading-relaxed text-foreground-soft sm:text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </ConfirmationContext.Provider>
  );
}
