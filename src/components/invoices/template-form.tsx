"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/label";

const PRESETS = [
  {
    title: "Správa webu",
    description: "Mesačná správa a údržba webstránky",
    unitPrice: "30",
    unit: "mes.",
    quantity: "1",
  },
  {
    title: "Mesačná zákazka",
    description: "Mesačná spolupráca",
    unitPrice: "800",
    unit: "mes.",
    quantity: "1",
  },
  {
    title: "Konzultácie",
    description: "Konzultačné hodiny",
    unitPrice: "50",
    unit: "hod.",
    quantity: "1",
  },
];

type TemplateValues = {
  clientId?: string;
  title?: string;
  description?: string;
  quantity?: string;
  unit?: string;
  unitPrice?: string;
  dueDays?: string;
  autoIssue?: boolean;
};

export function InvoiceTemplateForm({
  action,
  clients,
  initial,
  submitLabel = "Pridať šablónu",
  showPresets = false,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: { id: string; name: string }[];
  initial?: TemplateValues;
  submitLabel?: string;
  showPresets?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const form = formRef.current;
    if (!form) return;
    const set = (name: string, value: string) => {
      const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if (input) input.value = value;
    };
    set("title", preset.title);
    set("description", preset.description);
    set("unitPrice", preset.unitPrice);
    set("unit", preset.unit);
    set("quantity", preset.quantity);
  }

  return (
    <form ref={formRef} action={action} className="space-y-3">
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:border-brand/40 hover:text-brand"
              onClick={() => applyPreset(preset)}
            >
              {preset.title}
            </button>
          ))}
        </div>
      )}

      <FormField label="Klient *" htmlFor="clientId">
        <Select
          id="clientId"
          name="clientId"
          required
          defaultValue={initial?.clientId ?? ""}
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
      <FormField label="Názov *" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Správa webu"
        />
      </FormField>
      <FormField label="Popis na faktúre" htmlFor="description">
        <Input
          id="description"
          name="description"
          defaultValue={initial?.description}
          placeholder="Mesačná správa webstránky"
        />
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Množstvo" htmlFor="quantity">
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.quantity ?? "1"}
          />
        </FormField>
        <FormField label="Cena (€) *" htmlFor="unitPrice">
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            required
            defaultValue={initial?.unitPrice}
            placeholder="30"
          />
        </FormField>
        <FormField label="Jednotka" htmlFor="unit">
          <Input id="unit" name="unit" defaultValue={initial?.unit ?? "mes."} />
        </FormField>
      </div>
      <FormField label="Splatnosť (dni)" htmlFor="dueDays">
        <Input
          id="dueDays"
          name="dueDays"
          type="number"
          min="1"
          defaultValue={initial?.dueDays ?? "14"}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="autoIssue"
          defaultChecked={initial?.autoIssue}
          className="accent-brand"
        />
        Označiť ako mesačnú / na odoslanie
      </label>
      <Button type="submit" className="w-full" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
