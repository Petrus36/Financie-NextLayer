import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
          {subtitle && (
            <p
              className={cn("mt-1 text-xs", {
                "text-emerald-400": trend === "up",
                "text-red-400": trend === "down",
                "text-zinc-500": trend === "neutral" || !trend,
              })}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-violet-600/10 p-2.5 text-violet-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
