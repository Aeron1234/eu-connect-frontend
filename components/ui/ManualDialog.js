import { Info } from "lucide-react";
import Modal from "./Modal";

const defaultTriggerStyles = "inline-flex size-8 items-center justify-center rounded-full text-foreground-soft transition-colors hover:bg-muted hover:text-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function ManualDialog({ title, children, triggerStyles = defaultTriggerStyles, onBrand = false }) {
  return (
    <Modal
      title={title}
      triggerStyles={onBrand ? "inline-flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" : triggerStyles}
      trigger={<><Info className="size-5" aria-hidden="true" /><span className="sr-only">{title}</span></>}
    >
      {children}
    </Modal>
  );
}

export default ManualDialog;
