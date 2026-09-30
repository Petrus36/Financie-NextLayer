"use client";

import { useState } from "react";
import { Copy, Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleActiveButton } from "@/components/ui/toggle-active-button";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { InvoiceTemplateForm } from "@/components/invoices/template-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  createInvoiceFromTemplate,
  deleteInvoiceTemplate,
  duplicateInvoiceTemplate,
  toggleInvoiceTemplate,
  updateInvoiceTemplate,
} from "@/actions/invoices";

export type TemplateCardData = {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  dueDays: number;
  active: boolean;
  autoIssue: boolean;
  clientId: string;
  clientName: string;
  lastIssuedAt: string | null;
  lastIssuedNumber: string | null;
  issuedThisMonth: boolean;
};

export function TemplateCard({
  template,
  clients,
}: {
  template: TemplateCardData;
  clients: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const total = template.quantity * template.unitPrice;
  const updateAction = updateInvoiceTemplate.bind(null, template.id);

  return (
    <Card className={!template.active ? "opacity-60" : undefined}>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-zinc-100">{template.title}</p>
              <Badge variant={template.active ? "success" : "default"}>
                {template.active ? "Aktívna" : "Neaktívna"}
              </Badge>
              {template.autoIssue && <Badge variant="info">Mesačná</Badge>}
              {template.issuedThisMonth && (
                <Badge variant="warning">Tento mesiac vystavená</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">{template.clientName}</p>
            {template.description && (
              <p className="mt-1 text-sm text-zinc-400">{template.description}</p>
            )}
            <p className="mt-2 text-sm text-zinc-200">
              {template.quantity} {template.unit} × {formatCurrency(template.unitPrice)}{" "}
              = <span className="font-semibold text-brand">{formatCurrency(total)}</span>
              <span className="text-muted"> · splatnosť {template.dueDays} dní</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {template.lastIssuedAt
                ? `Naposledy ${template.lastIssuedNumber} · ${formatDate(template.lastIssuedAt)}`
                : "Zatiaľ nevystavená z tejto šablóny"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form action={createInvoiceFromTemplate.bind(null, template.id)}>
              <Button type="submit" size="sm">
                <FileText className="h-4 w-4" />
                Vystaviť
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setEditing((value) => !value)}
            >
              <Pencil className="h-4 w-4" />
              {editing ? "Zavrieť" : "Upraviť"}
            </Button>
            <form action={duplicateInvoiceTemplate.bind(null, template.id)}>
              <Button type="submit" size="sm" variant="ghost" title="Duplikovať">
                <Copy className="h-4 w-4" />
              </Button>
            </form>
            <ToggleActiveButton
              id={template.id}
              active={template.active}
              toggleAction={toggleInvoiceTemplate}
            />
            <DeleteItemButton
              id={template.id}
              deleteAction={deleteInvoiceTemplate}
            />
          </div>
        </div>

        {editing && (
          <div className="rounded-lg border border-border bg-black/30 p-4">
            <InvoiceTemplateForm
              action={async (formData) => {
                await updateAction(formData);
                setEditing(false);
              }}
              clients={clients}
              submitLabel="Uložiť šablónu"
              initial={{
                clientId: template.clientId,
                title: template.title,
                description: template.description ?? "",
                quantity: String(template.quantity),
                unit: template.unit,
                unitPrice: String(template.unitPrice),
                dueDays: String(template.dueDays),
                autoIssue: template.autoIssue,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
