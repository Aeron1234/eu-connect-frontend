import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Modal({
  children,
  trigger = null,
  triggerStyles = "",
  title,
  description = "",
}) {
  return (
    <Dialog>
      <DialogTrigger className={triggerStyles}>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={true}>
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
