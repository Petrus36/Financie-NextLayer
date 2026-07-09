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
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-violet-600 text-white hover:bg-violet-500 focus:ring-violet-500":
              variant === "primary",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:ring-zinc-600 border border-zinc-700":
              variant === "secondary",
            "bg-red-600/90 text-white hover:bg-red-500 focus:ring-red-500":
              variant === "danger",
            "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500":
              variant === "success",
            "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50":
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
