"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";

const PAYMENT_PRESETS = [
  { value: "Schválenie dizajnu", label: "Schválenie dizajnu" },
  { value: "Odovzdanie projektu", label: "Odovzdanie projektu" },
  { value: "Záloha", label: "Záloha" },
  { value: "custom", label: "Vlastný popis..." },
];

export function PaymentFormFields({ idPrefix = "pay" }: { idPrefix?: string }) {
  const [preset, setPreset] = useState(PAYMENT_PRESETS[0].value);
  const isCustom = preset === "custom";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="Typ platby *" htmlFor={`${idPrefix}-preset`}>
        <Select
          id={`${idPrefix}-preset`}
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          {PAYMENT_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </FormField>
      {isCustom ? (
        <FormField label="Popis platby *" htmlFor={`${idPrefix}-description`}>
          <Input
            id={`${idPrefix}-description`}
            name="description"
            required
            placeholder="Popis..."
          />
        </FormField>
      ) : (
        <input type="hidden" name="description" value={preset} />
      )}
      <FormField label="Suma (€) *" htmlFor={`${idPrefix}-amount`}>
        <Input
          id={`${idPrefix}-amount`}
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="1500.00"
        />
      </FormField>
      <FormField label="Dátum prijatia" htmlFor={`${idPrefix}-date`}>
        <Input
          id={`${idPrefix}-date`}
          name="date"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </FormField>
    </div>
  );
}
