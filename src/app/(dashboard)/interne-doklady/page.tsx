import Link from "next/link";
import { FileText, Wallet } from "lucide-react";
import { getFirmBalance } from "@/lib/firm-balance";
import {
  listInternalDocuments,
  listClientsForInternalDocumentForm,
} from "@/lib/internal-documents";
import { createInternalDocument } from "@/actions/finance";
import { InternalDocumentItem } from "@/components/finance/internal-document-item";
import { InternalDocumentFormFields } from "@/components/finance/internal-document-form-fields";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function InterneDokladyPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId: prefillClientId } = await searchParams;
  const [documents, clients, balance] = await Promise.all([
    listInternalDocuments(),
    listClientsForInternalDocumentForm(),
    getFirmBalance(),
  ]);

  const totalListed = documents.reduce((s, d) => s + d.amount, 0);
  const inStats = documents
    .filter((d) => d.countAsIncome)
    .reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Interné doklady</h1>
          <p className="text-sm text-muted">
            Hotovostné príjmy od klientov — priradia sa ku klientovi, hotovosti a
            štatistikám
          </p>
        </div>
        <Link href="/celkove-financie">
          <Button variant="secondary">
            <Wallet className="h-4 w-4" />
            Celkové financie
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Dokladov" value={String(documents.length)} />
        <StatCard title="Suma dokladov" value={formatCurrency(totalListed)} trend="up" />
        <StatCard
          title="V príjmoch / štatistikách"
          value={formatCurrency(inStats)}
          subtitle="So zaškrtnutým príjmom"
        />
        <StatCard
          title="V hotovosti (celkom)"
          value={formatCurrency(balance.cashAmount)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              Záznamy ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Zatiaľ žiadne interné doklady.
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <InternalDocumentItem
                    key={doc.id}
                    clients={clients}
                    doc={{
                      id: doc.id,
                      description: doc.description,
                      amount: doc.amount,
                      date: doc.date.toISOString(),
                      countAsIncome: doc.countAsIncome,
                      clientId: doc.clientId,
                      clientName: doc.client.name,
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Nový interný doklad</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="space-y-3 text-sm text-muted">
                <p>Najprv pridajte klienta.</p>
                <Link href="/clients/new">
                  <Button className="w-full">Nový klient</Button>
                </Link>
              </div>
            ) : (
              <form action={createInternalDocument} className="space-y-3">
                <InternalDocumentFormFields
                  clients={clients}
                  defaultClientId={prefillClientId}
                />
                <Button type="submit" className="w-full" variant="secondary">
                  Pridať
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
