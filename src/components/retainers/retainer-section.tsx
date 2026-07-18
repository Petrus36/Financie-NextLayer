"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { RetainerCard, RetainerData } from "@/components/retainers/retainer-card";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, Plus, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetainerSectionProps {
  retainers: RetainerData[];
  createAction: (formData: FormData) => Promise<void>;
}

export function RetainerSection({
  retainers,
  createAction,
}: RetainerSectionProps) {
  const [showForm, setShowForm] = useState(retainers.length === 0);

  const activeRetainers = retainers.filter((r) => r.active);
  const inactiveRetainers = retainers.filter((r) => !r.active);
  const earnedTotal = activeRetainers.reduce((s, r) => s + r.earnedThisMonth, 0);
  const potentialTotal = activeRetainers.reduce((s, r) => s + r.monthlyAmount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-brand" />
            Mesačné zákazky
          </CardTitle>
          <p className="mt-1.5 text-sm text-muted">
            Opakujúca sa mesačná spolupráca — sledujte počet dodaných položiek.
          </p>
        </div>
        {activeRetainers.length > 0 && (
          <div className="shrink-0 rounded-lg border border-brand/30 bg-brand-muted/20 px-3 py-2 text-right">
            <p className="text-xs text-muted">Zarobené tento mesiac</p>
            <p className="text-lg font-bold text-brand">{formatCurrency(earnedTotal)}</p>
            <p className="text-xs text-muted">z {formatCurrency(potentialTotal)}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {retainers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/30 px-6 py-10 text-center">
            <Repeat className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-3 text-sm font-medium text-zinc-200">
              Zatiaľ žiadna mesačná zákazka
            </p>
            <p className="mt-1 text-sm text-muted">
              Napr. 600 € mesačne za 6 marketingových videí — pridajte prvú zákazku nižšie.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRetainers.length > 0 && (
              <div className="grid gap-4">
                {activeRetainers.map((r) => (
                  <RetainerCard key={r.id} retainer={r} />
                ))}
              </div>
            )}

            {inactiveRetainers.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Pozastavené ({inactiveRetainers.length})
                </p>
                <div className="grid gap-3">
                  {inactiveRetainers.map((r) => (
                    <RetainerCard key={r.id} retainer={r} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated/30"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Plus className="h-4 w-4 text-brand" />
              {showForm ? "Skryť formulár" : "Pridať mesačnú zákazku"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted transition-transform",
                showForm && "rotate-180"
              )}
            />
          </button>

          {showForm && (
            <form action={createAction} className="border-t border-border p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Názov zákazky *" htmlFor="ret-title">
                  <Input
                    id="ret-title"
                    name="title"
                    required
                    placeholder="Marketing videá"
                  />
                </FormField>
                <FormField label="Mesačná suma (€) *" htmlFor="ret-amount">
                  <Input
                    id="ret-amount"
                    name="monthlyAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="600"
                  />
                </FormField>
                <FormField label="Počet dodávok / mesiac *" htmlFor="ret-target">
                  <Input
                    id="ret-target"
                    name="targetCount"
                    type="number"
                    min="1"
                    required
                    placeholder="6"
                  />
                </FormField>
                <FormField label="Typ dodávky" htmlFor="ret-label">
                  <Input
                    id="ret-label"
                    name="deliverableLabel"
                    defaultValue="videí"
                    placeholder="videí, príspevkov, bannerov..."
                  />
                </FormField>
              </div>
              <Button type="submit" className="mt-4" variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                Vytvoriť mesačnú zákazku
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
