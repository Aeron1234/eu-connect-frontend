export const modalFormContentClass =
  "flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] min-w-0 flex-col gap-0 overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-2xl sm:max-w-lg";

export const controlClass =
  "mt-1.5 min-h-10 w-full min-w-0 rounded-lg border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground shadow-xs outline-none transition-[background-color,border-color,box-shadow] placeholder:text-foreground-subtle/80 hover:border-foreground-faint/50 focus:border-primary/60 focus:bg-card focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-60 sm:min-h-11 sm:text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-emphasis";

export const modalFormLabelClass = "text-xs font-medium leading-5 text-foreground-soft";
export const modalFormSelectContentClass =
  "max-h-[min(18rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]";
export const modalFormButtonClass =
  "h-auto min-h-9 min-w-0 shrink-0 whitespace-normal rounded-lg px-3.5 py-2 text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-60 sm:min-h-10 sm:px-4 sm:text-sm";
export const modalFormPrimaryClass =
  modalFormButtonClass + " bg-primary text-primary-foreground shadow-sm hover:bg-primary/90";
export const modalFormCancelClass =
  modalFormButtonClass + " border border-border bg-card text-foreground-soft hover:bg-muted hover:text-foreground";
export const modalFormFooterClass =
  "shrink-0 border-t border-border/80 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4";
