"use client";

import { Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  incrementRetainer,
  decrementRetainer,
  resetRetainerPeriod,
  toggleRetainer,
  deleteRetainer,
} from "@/actions/finance";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { ToggleActiveButton } from "@/components/ui/toggle-active-button";

export interface RetainerData {
  id: string;
  title: string;
  monthlyAmount: number;
  deliverableLabel: string;
  targetCount: number;
  completedCount: number;
  active: boolean;
}

export function RetainerCard({ retainer }: { retainer: RetainerData }) {
  const progress =
    retainer.targetCount > 0
      ? Math.min(100, (retainer.completedCount / retainer.targetCount) * 100)
      : 0;
  const isComplete = retainer.completedCount >= retainer.targetCount;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isComplete ? "border-brand/40 bg-brand-muted/20" : "border-border bg-surface-elevated/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-100">{retainer.title}</p>
          <p className="mt-0.5 text-sm text-brand">
            {formatCurrency(retainer.monthlyAmount)}/mes.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ToggleActiveButton
            id={retainer.id}
            active={retainer.active}
            toggleAction={toggleRetainer}
          />
          <DeleteItemButton id={retainer.id} deleteAction={deleteRetainer} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {retainer.deliverableLabel} tento mesiac
          </span>
          <span
            className={cn(
              "font-semibold",
              isComplete ? "text-brand" : "text-zinc-200"
            )}
          >
            {retainer.completedCount} / {retainer.targetCount}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isComplete ? "bg-brand" : "bg-brand/70"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {retainer.active && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => decrementRetainer(retainer.id)}
            disabled={retainer.completedCount <= 0}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => incrementRetainer(retainer.id)}
            disabled={retainer.completedCount >= retainer.targetCount}
          >
            <Plus className="h-3.5 w-3.5" />
            +1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetRetainerPeriod(retainer.id)}
            title="Resetovať progress (nový mesiac)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nový mesiac
          </Button>
        </div>
      )}
    </div>
  );
}
