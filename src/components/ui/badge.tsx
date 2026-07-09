import { cn } from "@/lib/utils";

const variants = {
  default: "bg-zinc-800 text-zinc-300",
  success: "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30",
  warning: "bg-amber-600/20 text-amber-400 border border-amber-600/30",
  danger: "bg-red-600/20 text-red-400 border border-red-600/30",
  info: "bg-violet-600/20 text-violet-400 border border-violet-600/30",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
