import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const controlClass =
  "mt-1 min-h-11 w-full rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-[background-color,border-color,box-shadow] placeholder:text-foreground-subtle focus:border-primary/60 focus:bg-card focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-1.5 sm:px-3.5 sm:py-2.5 sm:focus:ring-4 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:font-semibold file:text-primary-emphasis";

function Root({ children, className, ...props }) {
  return (
    <form className={cn("flex min-w-0 flex-1 flex-col gap-4 sm:gap-6", className)} {...props}>
      {children}
    </form>
  );
}

function Section({ title, optional = false, children, className }) {
  return (
    <section
      className={cn(
        "min-w-0 border-l-2 pl-2.5 sm:pl-5",
        optional ? "border-border" : "border-primary/60",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-5">
        <h3 className="text-sm font-bold text-foreground">
          {title ?? (optional ? "Optional Information" : "Required Information")}
        </h3>
        {optional && title !== "Optional Information" && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground-subtle">
            Optional
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:gap-5">{children}</div>
    </section>
  );
}

function Row({ children, className }) {
  return <div className={cn("flex min-w-0 gap-3 max-sm:flex-col sm:gap-5", className)}>{children}</div>;
}

function Field({ label, children, className, as = "label" }) {
  const Component = as;
  return (
    <Component className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <span className="text-xs font-semibold tracking-wide text-foreground-soft">{label}</span>
      {children}
    </Component>
  );
}

function Input({ className, ...props }) {
  return <input className={cn(controlClass, className)} {...props} />;
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(controlClass, "min-h-24 resize-y leading-relaxed sm:min-h-32", className)}
      {...props}
    />
  );
}

function Select({ className, ...props }) {
  return <select className={cn(controlClass, className)} {...props} />;
}

function Confirmation({ children, title = "Confirm Action" }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:gap-3 sm:p-5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-emphasis sm:size-9">
        <Info className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground-soft sm:mt-1">{children}</p>
      </div>
    </div>
  );
}

function Actions({
  children,
  isPending = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  className,
  submitClassName,
  closeOnSubmit = true,
  disableCancelWhilePending = false,
}) {
  const submitButton = (
    <Button
      type="submit"
      className={cn("min-h-11 w-full rounded-xl bg-primary px-6 font-semibold text-white shadow-sm hover:bg-primary-600 sm:w-auto", submitClassName)}
      disabled={isPending}
    >
      {isPending ? (
        <Spinner className="size-6 stroke-3 stroke-primary-50" />
      ) : (
        children ?? submitLabel
      )}
    </Button>
  );

  return (
    <DialogFooter className="mt-1 border-t border-border pt-3 sm:pt-5">
      <div className={cn("flex w-full flex-col-reverse gap-2 font-medium sm:flex-row sm:justify-end sm:gap-2.5", className)}>
        <DialogClose asChild>
          <Button
            variant="outline"
            type="button"
            className="min-h-11 w-full rounded-xl px-5 sm:w-auto"
            disabled={disableCancelWhilePending && isPending}
          >
            {cancelLabel}
          </Button>
        </DialogClose>
        {closeOnSubmit ? <DialogClose asChild>{submitButton}</DialogClose> : submitButton}
      </div>
    </DialogFooter>
  );
}

const ModalForm = {
  Root,
  Section,
  Row,
  Field,
  Input,
  Textarea,
  Select,
  Confirmation,
  Actions,
};

export { controlClass };
export default ModalForm;
