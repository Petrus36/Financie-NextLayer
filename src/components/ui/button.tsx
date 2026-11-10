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
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand text-black shadow-[0_0_20px_rgba(186,255,87,0.25)] hover:bg-brand-hover focus:ring-brand":
              variant === "primary" || variant === "success",
            "border border-white/15 bg-white/[0.08] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md hover:bg-white/[0.12] focus:ring-brand":
              variant === "secondary",
            "bg-red-600/80 text-white shadow-lg backdrop-blur-sm hover:bg-red-500 focus:ring-red-500":
              variant === "danger",
            "bg-transparent text-muted hover:bg-white/[0.06] hover:text-zinc-100 backdrop-blur-sm":
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
