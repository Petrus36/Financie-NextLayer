import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
