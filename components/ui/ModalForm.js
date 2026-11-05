"use client";

import { DialogClose, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Children, isValidElement } from "react";
import { Info, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { showActionError } from "@/lib/toast-and-action.mjs";
import { validateModalForm } from "@/lib/modal-form-validation.mjs";
import {
  controlClass,
  modalFormLabelClass,
  modalFormPrimaryClass,
  modalFormCancelClass,
  modalFormFooterClass,
} from "./modalFormStyles";
import {
  useConfirmationLayout,
  confirmationActionGroupClass,
  confirmationCancelClass,
  confirmationPrimaryClass,
} from "./ConfirmationContent";

function Root({ children, className, onSubmit, onClickCapture, ...props }) {
  const confirmation = useConfirmationLayout();
  const validate = (form) => validateModalForm(form, (message) => showActionError(toast, message));
  const validationProps = {
    // Validate before an action or DialogClose runs, using the action toast
    // instead of a browser tooltip that disappears with the dialog.
    noValidate: true,
    onClickCapture(event) {
      onClickCapture?.(event);
      if (event.defaultPrevented) return;
      const submitter = event.target.closest?.("button, input");
      if (submitter?.type === "submit" && submitter.form === event.currentTarget &&
          !submitter.formNoValidate && !validate(event.currentTarget)) event.preventDefault();
    },
    // Keyboard/programmatic submit events also validate; click capture alone is
    // insufficient. formNoValidate remains an explicit per-submitter bypass.
    onSubmit(event) {
      if (event.defaultPrevented) return;
      if (!event.nativeEvent?.submitter?.formNoValidate && !validate(event.currentTarget)) {
        event.preventDefault();
        return;
      }
      onSubmit?.(event);
    },
  };
  if (confirmation) {
    return (
      <form className={cn("flex min-w-0 flex-1 flex-col gap-4 sm:gap-5", className)} {...props} {...validationProps}>
        {children}
      </form>
    );
  }

  // Only direct Actions/Footer children stay outside the scrolling form body.
  // Nested footers are not detected by this layout split.
  const content = Children.toArray(children);
  const isFooter = (child) => isValidElement(child) && (child.type === Actions || child.type === Footer);
  return (
    <form className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)} {...props} {...validationProps}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 py-5 sm:gap-6 sm:px-6 sm:py-6">
        {content.filter((child) => !isFooter(child))}
      </div>
      {content.filter(isFooter)}
    </form>
  );
}

function Section({ title, description, optional = false, children, className }) {
  return (
    <section
      className={cn(
        "min-w-0 border-b border-dashed border-border/80 pb-5 last:border-0 last:pb-0 sm:pb-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary-emphasis" aria-hidden="true">
          <LayoutList className="size-3.5" />
        </span>
        <h3 className="min-w-0 text-[13px] font-semibold text-foreground sm:text-sm">
          {title ?? (optional ? "Optional Information" : "Required Information")}
        </h3>
        {optional && title !== "Optional Information" && (
          <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground-subtle">
            Optional
          </span>
        )}
      </div>
      {description && <p className="-mt-2 mb-4 text-xs leading-relaxed text-foreground-subtle">{description}</p>}
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

function Row({ children, className }) {
  return <div className={cn("flex min-w-0 flex-col gap-4 sm:flex-row", className)}>{children}</div>;
}

function Field({ label, children, className, as = "label" }) {
  const Component = as;
  return (
    <Component className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <span className={modalFormLabelClass}>{label}</span>
      {children}
    </Component>
  );
}

function Input({ className, ...props }) {
  return <input className={cn(controlClass, props.type === "file" && "border-dashed bg-muted/20 py-3", className)} {...props} />;
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

function Footer({ children, className }) {
  return <DialogFooter className={cn(modalFormFooterClass, className)}>{children}</DialogFooter>;
}

function Confirmation({ children, title = "Confirm Action" }) {
  const confirmation = useConfirmationLayout();
  if (confirmation) {
    // Register the body description with Radix only when the header has none.
    const Description = confirmation.descriptionId ? DialogDescription : 'p';
    return (
      <Description className="break-words text-center text-xs leading-relaxed text-foreground-soft sm:text-sm">
        {children}
      </Description>
    );
  }
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

// closeOnSubmit wraps the submit control in DialogClose immediately; it does not
// wait for a successful server response. Forms that must retain drafts on save
// failure opt out and close from their confirmed-success handler.
function Actions({
  children,
  isPending = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  className,
  submitClassName,
  closeOnSubmit = true,
  disableCancelWhilePending = false,
  submitDisabled = false,
}) {
  const confirmation = useConfirmationLayout();
  const submitButton = (
    <Button
      type="submit"
      className={cn(confirmation ? confirmationPrimaryClass : modalFormPrimaryClass, submitClassName)}
      disabled={isPending || submitDisabled}
    >
      {isPending ? (
        <Spinner className="size-4" />
      ) : (
        children ?? submitLabel
      )}
    </Button>
  );

  return (
    <DialogFooter className={confirmation ? "w-full" : modalFormFooterClass}>
      <div className={cn(confirmation ? confirmationActionGroupClass : "flex min-w-0 w-full items-stretch justify-end gap-2", className)}>
        <DialogClose asChild>
          <Button
            variant="outline"
            type="button"
            className={confirmation ? confirmationCancelClass : modalFormCancelClass}
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
  Footer,
};

export { controlClass };
export default ModalForm;
