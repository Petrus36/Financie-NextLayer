import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors resize-none",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
