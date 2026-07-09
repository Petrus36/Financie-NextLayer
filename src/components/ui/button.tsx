import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand text-black hover:bg-brand-hover focus:ring-brand":
              variant === "primary" || variant === "success",
            "bg-surface-elevated text-zinc-100 hover:bg-border-strong focus:ring-brand border border-border-strong":
              variant === "secondary",
            "bg-red-600/90 text-white hover:bg-red-500 focus:ring-red-500":
              variant === "danger",
            "bg-transparent text-muted hover:text-zinc-100 hover:bg-surface-elevated":
              variant === "ghost",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
