"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { InternalDocumentFormFields } from "@/components/finance/internal-document-form-fields";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  deleteInternalDocument,
  updateInternalDocument,
} from "@/actions/finance";

export type InternalDocumentItemData = {
  id: string;
  description: string;
  amount: number;
  date: string;
  countAsIncome: boolean;
  clientId: string;
  clientName: string;
};

type ClientOption = { id: string; name: string; company: string | null };

function toDateInputValue(isoDate: string) {
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function InternalDocumentItem({
  doc,
  clients,
}: {
  doc: InternalDocumentItemData;
  clients: ClientOption[];
}) {
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
        <InternalDocumentFormFields
          clients={clients}
          defaultClientId={doc.clientId}
          idPrefix={`-${doc.id}`}
          defaultDescription={doc.description}
          defaultAmount={doc.amount}
          defaultDate={toDateInputValue(doc.date)}
          defaultCountAsIncome={doc.countAsIncome}
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
          <Link href={`/clients/${doc.clientId}`} className="text-brand hover:underline">
            {doc.clientName}
          </Link>
          {" · "}
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
