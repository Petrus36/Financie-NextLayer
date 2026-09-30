import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCompanySettings, nextInvoiceNumber } from "@/lib/company";
import { createInvoice } from "@/actions/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, company, suggestedNumber] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getCompanySettings(),
    nextInvoiceNumber(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na faktúry
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nová faktúra</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-sm text-muted">
              Najprv pridajte klienta v sekcii Klienti.
            </p>
          ) : (
            <InvoiceForm
              action={createInvoice}
              clients={clients}
              defaultClientId={clientId}
              defaultDueDays={company.defaultDueDays}
              suggestedNumber={suggestedNumber}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
