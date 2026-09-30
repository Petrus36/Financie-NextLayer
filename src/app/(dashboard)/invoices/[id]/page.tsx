import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCompanySettings } from "@/lib/company";
import { updateInvoice } from "@/actions/invoices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { displayInvoiceStatus, toDateInput } from "@/lib/invoices";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, company, clients] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: true, income: true },
    }),
    getCompanySettings(),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!invoice) notFound();

  const status = displayInvoiceStatus(invoice);
  const updateAction = updateInvoice.bind(null, invoice.id);

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na faktúry
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">
              Faktúra {invoice.number}
            </h1>
            <Badge variant={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {invoice.client.name} · vystavená {formatDate(invoice.issuedAt)} ·
            splatnosť {formatDate(invoice.dueAt)}
          </p>
          {invoice.income && (
            <p className="mt-1 text-xs text-brand">
              Započítané do príjmov: {formatCurrency(invoice.income.amount)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="secondary">Otvoriť PDF</Button>
          </a>
          <a href={`/api/invoices/${invoice.id}/pdf?download=1`}>
            <Button variant="primary">
              <Download className="h-4 w-4" />
              Stiahnuť PDF
            </Button>
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stav a odoslanie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted">
            Kliknutím na <strong className="text-zinc-200">Zaplatená</strong> sa
            suma automaticky pridá do príjmov firmy a štatistík.
          </p>
          <InvoiceActions
            id={invoice.id}
            status={invoice.status}
            clientEmail={invoice.client.email}
            number={invoice.number}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Odberateľ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p className="font-medium text-zinc-100">
              {invoice.client.company || invoice.client.name}
            </p>
            {invoice.client.address && <p>{invoice.client.address}</p>}
            {(invoice.client.zip || invoice.client.city) && (
              <p>
                {invoice.client.zip} {invoice.client.city}
              </p>
            )}
            {invoice.client.ico && <p>IČO: {invoice.client.ico}</p>}
            {invoice.client.dic && <p>DIČ: {invoice.client.dic}</p>}
            {invoice.client.icDph && <p>IČ DPH: {invoice.client.icDph}</p>}
            {invoice.client.email && <p>{invoice.client.email}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dodávateľ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p className="font-medium text-zinc-100">{company.name}</p>
            {company.address && <p>{company.address}</p>}
            {(company.zip || company.city) && (
              <p>
                {company.zip} {company.city}
              </p>
            )}
            {company.ico && <p>IČO: {company.ico}</p>}
            {company.iban && <p>IBAN: {company.iban}</p>}
            <p>VS: {invoice.number}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Položky · {formatCurrency(invoice.total)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoice.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <div>
                <p className="text-zinc-100">{item.description}</p>
                <p className="text-xs text-muted">
                  {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="font-medium text-zinc-100">
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {invoice.status !== "PAID" && (
        <Card>
          <CardHeader>
            <CardTitle>Upraviť faktúru</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              action={updateAction}
              clients={clients}
              defaultClientId={invoice.clientId}
              defaultDueDays={company.defaultDueDays}
              submitLabel="Uložiť zmeny"
              initial={{
                number: invoice.number,
                issuedAt: toDateInput(invoice.issuedAt),
                dueAt: toDateInput(invoice.dueAt),
                notes: invoice.notes ?? "",
                items: invoice.items.map((item) => ({
                  description: item.description,
                  quantity: String(item.quantity),
                  unit: item.unit,
                  unitPrice: String(item.unitPrice),
                })),
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
