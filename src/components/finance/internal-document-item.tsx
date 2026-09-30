"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  deleteInternalDocument,
  updateInternalDocument,
} from "@/actions/finance";
import { InternalDocumentCountAsIncomeField } from "@/components/finance/internal-document-count-as-income-field";

export type InternalDocumentItemData = {
  id: string;
  description: string;
  amount: number;
  date: string;
  countAsIncome: boolean;
};

function toDateInputValue(isoDate: string) {
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function InternalDocumentItem({ doc }: { doc: InternalDocumentItemData }) {
  const [editing, setEditing] = useState(false);
  const updateAction = updateInternalDocument.bind(null, doc.id);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateAction(formData);
          setEditing(false);
        }}
        className="space-y-3 rounded-lg border border-brand/30 bg-surface-elevated/50 p-3"
      >
        <FormField label="Item" htmlFor={`description-${doc.id}`}>
          <Input
            id={`description-${doc.id}`}
            name="description"
            required
            defaultValue={doc.description}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Suma" htmlFor={`amount-${doc.id}`}>
            <Input
              id={`amount-${doc.id}`}
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={doc.amount}
            />
          </FormField>
          <FormField label="Dátum" htmlFor={`date-${doc.id}`}>
            <Input
              id={`date-${doc.id}`}
              name="date"
              type="date"
              required
              defaultValue={toDateInputValue(doc.date)}
            />
          </FormField>
        </div>
        <InternalDocumentCountAsIncomeField
          idSuffix={`-${doc.id}`}
          defaultChecked={doc.countAsIncome}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm">
            Uložiť
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Zrušiť
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <p className="text-sm text-zinc-200">{doc.description}</p>
        <p className="text-xs text-muted">
          {formatDate(doc.date)}
          {doc.countAsIncome ? " · v príjmoch" : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="mr-1 text-sm font-medium text-brand">
          {formatCurrency(doc.amount)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          aria-label="Upraviť interný doklad"
        >
          <Pencil className="h-3.5 w-3.5 text-zinc-400" />
        </Button>
        <DeleteItemButton id={doc.id} deleteAction={deleteInternalDocument} />
      </div>
    </div>
  );
}
