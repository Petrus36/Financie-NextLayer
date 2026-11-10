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
        "w-full rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md placeholder:text-muted focus:border-brand/70 focus:outline-none focus:ring-1 focus:ring-brand/50 transition-colors resize-none",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
