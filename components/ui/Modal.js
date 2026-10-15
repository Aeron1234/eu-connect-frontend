import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConfirmationContent from "./ConfirmationContent";
import FormDialogContent from "./FormDialogContent";

function Modal({
  children,
  trigger = null,
  title,
  description = "",
  disabled = false,
  triggerStyles = "",
  onClick = null,
  titleStyles = "",
  open,
  onOpenChange,
  variant = "default",
  intent = "warning",
}) {
  if (disabled) return null;

  return (
    <Dialog {...(open === undefined ? {} : { open, onOpenChange })}>
      <DialogTrigger
        disabled={disabled}
        className={triggerStyles}
        onClick={onClick}
      >
        {trigger}
      </DialogTrigger>
      {variant === "confirmation" ? (
        <ConfirmationContent title={title} description={description} intent={intent} formDescription>
          {children}
        </ConfirmationContent>
      ) : variant === "form" ? (
        <FormDialogContent title={title} description={description} titleStyles={titleStyles}>
          {children}
        </FormDialogContent>
      ) : (
        <DialogContent
          showCloseButton={true}
          className="flex max-h-[calc(100dvh-1rem)] flex-col gap-3 overflow-auto p-3.5 sm:max-h-150 sm:gap-4 sm:p-6"
          {...(!description ? { "aria-describedby": undefined } : {})}
        >
          <DialogHeader className="text-left">
            <DialogTitle className={`flex items-center gap-2 pr-6 text-left text-sm sm:text-base ${titleStyles}`}>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className={"text-sm"}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      )}
    </Dialog>
  );
}

export default Modal;
