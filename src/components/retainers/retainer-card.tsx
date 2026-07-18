"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Power, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatMonthYear, cn } from "@/lib/utils";
import {
  incrementRetainer,
  decrementRetainer,
  toggleRetainer,
  deleteRetainer,
} from "@/actions/finance";

export interface RetainerData {
  id: string;
  title: string;
  monthlyAmount: number;
  deliverableLabel: string;
  targetCount: number;
  completedCount: number;
  active: boolean;
  periodStart: Date | string;
  earnedThisMonth: number;
}

export function RetainerCard({ retainer }: { retainer: RetainerData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticCount, setOptimisticCount] = useOptimistic(retainer.completedCount);
  const [optimisticEarned, setOptimisticEarned] = useOptimistic(retainer.earnedThisMonth);

  const progress =
    retainer.targetCount > 0
      ? Math.min(100, (optimisticCount / retainer.targetCount) * 100)
      : 0;
  const remaining = Math.max(0, retainer.targetCount - optimisticCount);
  const isComplete = optimisticCount >= retainer.targetCount;
  const unitPrice =
    retainer.targetCount > 0 ? retainer.monthlyAmount / retainer.targetCount : 0;
  const periodLabel = formatMonthYear(new Date(retainer.periodStart));

  function runAction(
    action: () => Promise<void>,
    nextCount?: number,
    nextEarned?: number
  ) {
    startTransition(async () => {
      if (nextCount !== undefined) setOptimisticCount(nextCount);
      if (nextEarned !== undefined) setOptimisticEarned(nextEarned);
      await action();
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-colors",
        !retainer.active && "border-border/60 bg-surface/40 opacity-75",
        retainer.active && isComplete && "border-brand/50 bg-brand-muted/15",
        retainer.active && !isComplete && "border-border bg-surface-elevated/60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-100">{retainer.title}</h3>
            {!retainer.active && <Badge variant="default">Neaktívna</Badge>}
            {retainer.active && isComplete && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Splnené
              </Badge>
            )}
          </div>
          <p className="mt-1 text-lg font-bold text-brand">
            {formatCurrency(optimisticEarned)}
            <span className="text-sm font-normal text-muted"> zarobené</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Cieľ mesiaca: {formatCurrency(retainer.monthlyAmount)} · Obdobie: {periodLabel}
            {retainer.targetCount > 0 && (
              <> · {formatCurrency(unitPrice)} / {retainer.deliverableLabel}</>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() =>
              runAction(() => toggleRetainer(retainer.id, !retainer.active))
            }
            title={retainer.active ? "Pozastaviť zákazku" : "Obnoviť zákazku"}
          >
            <Power
              className={cn(
                "h-4 w-4",
                retainer.active ? "text-brand" : "text-muted"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (!confirm("Naozaj zmazať túto mesačnú zákazku?")) return;
              runAction(() => deleteRetainer(retainer.id));
            }}
            title="Zmazať zákazku"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              {retainer.deliverableLabel} tento mesiac
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-100">
              {optimisticCount}
              <span className="text-lg font-medium text-muted">
                {" "}
                / {retainer.targetCount}
              </span>
            </p>
          </div>
          {retainer.active && remaining > 0 && (
            <p className="text-right text-xs text-muted">
              Zostáva{" "}
              <span className="font-medium text-zinc-300">{remaining}</span>
            </p>
          )}
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-surface">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isComplete ? "bg-brand" : "bg-brand/75"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {retainer.active && (
        <div className="mt-5 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={pending || optimisticCount <= 0}
            onClick={() =>
              runAction(
                () => decrementRetainer(retainer.id),
                Math.max(0, optimisticCount - 1),
                Math.max(0, optimisticEarned - unitPrice)
              )
            }
            className="h-10 w-10 shrink-0 p-0"
            aria-label="Odobrať 1"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={pending || optimisticCount >= retainer.targetCount}
            onClick={() =>
              runAction(
                () => incrementRetainer(retainer.id),
                Math.min(retainer.targetCount, optimisticCount + 1),
                optimisticEarned + unitPrice
              )
            }
            className="min-h-10 flex-1"
          >
            <Plus className="h-4 w-4" />
            Pridať 1 · {retainer.deliverableLabel}
          </Button>
        </div>
      )}

      {retainer.active && (
        <p className="mt-3 text-xs text-muted">
          Každá dodávka pridá {formatCurrency(unitPrice)} do príjmov. Progress sa resetuje každý mesiac.
        </p>
      )}
    </div>
  );
}
