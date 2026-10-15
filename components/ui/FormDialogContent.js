import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { cn } from "@/lib/utils";
import { modalFormContentClass } from "./modalFormStyles";

export default function FormDialogContent({
  title,
  description,
  titleStyles,
  className,
  children,
  ...props
}) {
  return (
    <DialogContent
      className={cn(modalFormContentClass, className)}
      {...(!description ? { "aria-describedby": undefined } : {})}
      {...props}
    >
      <DialogHeader className="shrink-0 gap-1.5 border-b border-border/80 px-4 py-4 text-left sm:px-6 sm:py-5 sm:text-left">
        <DialogTitle className={cn("flex min-w-0 items-center gap-2 pr-7 text-base font-semibold leading-snug tracking-tight text-foreground [&_span]:text-inherit sm:text-lg", titleStyles)}>
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="pr-6 text-xs leading-relaxed text-foreground-soft sm:text-[13px]">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>
      {children}
    </DialogContent>
  );
}
