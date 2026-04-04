import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Modal({
  children,
  trigger = null,
  title,
  description = "",
  disabled = false,
  triggerStyles = "",
}) {
  if (disabled) return null;

  return (
    <Dialog>
      <DialogTrigger disabled={disabled} className={triggerStyles}>
        {trigger}
      </DialogTrigger>
      <DialogContent showCloseButton={true} className={"flex flex-col"}>
        <DialogHeader>
          <DialogTitle className={"text-base"}>{title}</DialogTitle>
          {description && (
            <DialogDescription className={"text-sm"}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
