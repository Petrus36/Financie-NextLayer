import Link from "next/link";
import { Plus, Mail, Phone, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      invoices: {
        select: { total: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Klienti</h1>
          <p className="text-sm text-zinc-400">{clients.length} klientov celkom</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            Pridať klienta
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-400">Zatiaľ nemáte žiadnych klientov.</p>
            <Link href="/clients/new" className="mt-4 inline-block">
              <Button variant="secondary">Pridať prvého klienta</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const paidTotal = client.invoices
              .filter((invoice) => invoice.status === "PAID")
              .reduce((sum, invoice) => sum + invoice.total, 0);
            const openCount = client.invoices.filter(
              (invoice) => invoice.status === "DRAFT" || invoice.status === "SENT"
            ).length;

            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="transition-all hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5">
                  <CardContent className="p-5">
                    <div>
                      <h3 className="font-semibold text-zinc-100">{client.name}</h3>
                      {client.company && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                          <Building2 className="h-3 w-3" />
                          {client.company}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 space-y-1.5">
                      {client.email && (
                        <p className="flex items-center gap-2 text-xs text-zinc-400">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p className="flex items-center gap-2 text-xs text-zinc-400">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-xs text-muted">Zaplatené nám</p>
                        <p className="text-sm font-medium text-brand">
                          {formatCurrency(paidTotal)}
                        </p>
                      </div>
                      <p className="text-xs text-muted">
                        {openCount > 0
                          ? `${openCount} čaká na úhradu`
                          : `${client.invoices.length} faktúr`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
