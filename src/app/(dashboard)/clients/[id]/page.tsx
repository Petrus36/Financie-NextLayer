import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { displayInvoiceStatus } from "@/lib/invoices";
import { PROJECT_STAGE_LABEL, projectFinance } from "@/lib/projects";
import { createInvoiceFromTemplate } from "@/actions/invoices";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      invoices: { orderBy: { issuedAt: "desc" } },
      invoiceTemplates: { where: { active: true } },
      projects: {
        orderBy: { updatedAt: "desc" },
        include: {
          payments: { select: { amount: true } },
          expenses: { select: { amount: true } },
          payouts: { select: { amount: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const paidInvoices = client.invoices.filter((invoice) => invoice.status === "PAID");
  const openInvoices = client.invoices.filter(
    (invoice) => invoice.status === "DRAFT" || invoice.status === "SENT"
  );
  const paidTotal = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const openTotal = openInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na klientov
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{client.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            {client.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {client.company}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {client.phone}
              </span>
            )}
          </div>
          {(client.ico || client.address) && (
            <p className="mt-2 text-xs text-muted">
              {client.ico && `IČO ${client.ico}`}
              {client.ico && client.address && " · "}
              {[client.address, client.zip, client.city].filter(Boolean).join(", ")}
            </p>
          )}
          {client.notes && (
            <p className="mt-2 text-sm text-muted">{client.notes}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/clients/${id}/edit`}>
            <Button variant="secondary">Upraviť</Button>
          </Link>
          <Link href={`/invoices/new?clientId=${id}`}>
            <Button>Nová faktúra</Button>
          </Link>
          <Link href={`/projects/new?clientId=${id}`}>
            <Button variant="secondary">Nový projekt</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Zaplatené nám"
          value={formatCurrency(paidTotal)}
          subtitle={`${paidInvoices.length} zaplatených faktúr`}
          trend="up"
        />
        <StatCard
          title="Čaká na úhradu"
          value={formatCurrency(openTotal)}
          subtitle={`${openInvoices.length} otvorených`}
        />
        <StatCard
          title="Faktúry spolu"
          value={String(client.invoices.length)}
          subtitle="Všetky vystavené"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projekty</CardTitle>
          <Link href={`/projects/new?clientId=${client.id}`} className="text-sm text-brand hover:underline">
            Nový
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {client.projects.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">Žiadne projekty.</p>
          ) : (
            client.projects.map((project) => {
              const finance = projectFinance(project);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-elevated/30"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{project.title}</p>
                    <p className="text-xs text-muted">
                      {PROJECT_STAGE_LABEL[project.stage]} · plus/mínus{" "}
                      {formatCurrency(finance.realized)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-zinc-100">
                    {formatCurrency(project.price)}
                  </span>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Šablóny faktúr</CardTitle>
          <Link
            href={`/invoices/templates?clientId=${client.id}`}
            className="text-sm text-brand hover:underline"
          >
            Spravovať
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {client.invoiceTemplates.length === 0 ? (
            <p className="text-sm text-muted">
              Žiadna aktívna šablóna.{" "}
              <Link
                href={`/invoices/templates?clientId=${client.id}`}
                className="text-brand hover:underline"
              >
                Pridať šablónu
              </Link>
            </p>
          ) : (
            client.invoiceTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">{template.title}</p>
                  <p className="text-xs text-muted">
                    {template.quantity} {template.unit} ×{" "}
                    {formatCurrency(template.unitPrice)} ={" "}
                    {formatCurrency(template.quantity * template.unitPrice)}
                  </p>
                </div>
                <form action={createInvoiceFromTemplate.bind(null, template.id)}>
                  <Button type="submit" size="sm" variant="secondary">
                    Vystaviť
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faktúry</CardTitle>
        </CardHeader>
        <CardContent>
          {client.invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Zatiaľ žiadne faktúry.{" "}
              <Link
                href={`/invoices/new?clientId=${id}`}
                className="text-brand hover:underline"
              >
                Vystaviť prvú
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {client.invoices.map((invoice) => {
                const status = displayInvoiceStatus(invoice);
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-elevated/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {invoice.number}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(invoice.issuedAt)}
                        {invoice.paidAt ? ` · zaplatená ${formatDate(invoice.paidAt)}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand">
                        {formatCurrency(invoice.total)}
                      </p>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
