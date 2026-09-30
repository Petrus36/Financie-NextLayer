"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { lineTotal } from "@/lib/invoices";

type Line = {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

const emptyLine = (): Line => ({
  description: "",
  quantity: "1",
  unit: "ks",
  unitPrice: "",
});

export function InvoiceForm({
  action,
  clients,
  defaultClientId,
  defaultDueDays = 14,
  suggestedNumber,
  initial,
  submitLabel = "Vytvoriť faktúru",
}: {
  action: (formData: FormData) => Promise<void>;
  clients: { id: string; name: string }[];
  defaultClientId?: string;
  defaultDueDays?: number;
  suggestedNumber?: string;
  initial?: {
    number?: string;
    issuedAt: string;
    dueAt: string;
    notes: string;
    items: Line[];
  };
  submitLabel?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + defaultDueDays);

  const [items, setItems] = useState<Line[]>(
    initial?.items?.length ? initial.items : [emptyLine()]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + lineTotal(parseFloat(item.quantity) || 0, parseFloat(item.unitPrice) || 0),
        0
      ),
    [items]
  );

  function update(index: number, patch: Partial<Line>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Číslo faktúry *" htmlFor="number">
          <Input
            id="number"
            name="number"
            required
            defaultValue={initial?.number ?? suggestedNumber}
            placeholder="2026060"
          />
        </FormField>
        <FormField label="Klient *" htmlFor="clientId">
          <Select
            id="clientId"
            name="clientId"
            required
            defaultValue={defaultClientId ?? ""}
          >
            <option value="" disabled>
              Vyberte klienta
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <p className="-mt-3 text-xs text-muted">
        Predvyplnené je ďalšie číslo po poslednej faktúre. Môžete ho zmeniť —
        používa sa aj ako variabilný symbol.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Dátum vystavenia" htmlFor="issuedAt">
          <Input
            id="issuedAt"
            name="issuedAt"
            type="date"
            defaultValue={initial?.issuedAt ?? today}
          />
        </FormField>
        <FormField label="Splatnosť" htmlFor="dueAt">
          <Input
            id="dueAt"
            name="dueAt"
            type="date"
            defaultValue={initial?.dueAt ?? defaultDue.toISOString().slice(0, 10)}
          />
        </FormField>
      </div>

      <FormField label="Poznámka na faktúre" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={initial?.notes}
          placeholder="Voliteľná poznámka pod platobnými údajmi"
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-200">Položky</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setItems((current) => [...current, emptyLine()])}
          >
            <Plus className="h-4 w-4" />
            Položka
          </Button>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 rounded-lg border border-border p-3"
          >
            <div className="col-span-12 sm:col-span-5">
              <Input
                name="itemDescription"
                required
                placeholder="Správa webu, video, aplikácia..."
                value={item.description}
                onChange={(e) => update(index, { description: e.target.value })}
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <Input
                name="itemQuantity"
                type="number"
                step="0.01"
                min="0"
                value={item.quantity}
                onChange={(e) => update(index, { quantity: e.target.value })}
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <Input
                name="itemUnit"
                value={item.unit}
                onChange={(e) => update(index, { unit: e.target.value })}
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <Input
                name="itemUnitPrice"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="30.00"
                value={item.unitPrice}
                onChange={(e) => update(index, { unitPrice: e.target.value })}
              />
            </div>
            <div className="col-span-12 flex items-center justify-between sm:col-span-1 sm:justify-end">
              <span className="text-xs text-muted sm:hidden">
                {formatCurrency(
                  lineTotal(parseFloat(item.quantity) || 0, parseFloat(item.unitPrice) || 0)
                )}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={items.length === 1}
                onClick={() =>
                  setItems((current) => current.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-brand/30 bg-brand-muted/15 px-4 py-3">
        <span className="text-sm text-muted">Spolu na úhradu</span>
        <span className="text-lg font-bold text-brand">{formatCurrency(total)}</span>
      </div>

      <Button type="submit" className="w-full" variant="primary">
        {submitLabel}
      </Button>
    </form>
  );
}
