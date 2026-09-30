import Link from "next/link";
import { ArrowLeft, Layers, Sparkles, Wallet } from "lucide-react";
import { startOfMonth } from "date-fns";
import {
  createInvoiceTemplate,
  issueActiveTemplatesThisMonth,
} from "@/actions/invoices";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { InvoiceTemplateForm } from "@/components/invoices/template-form";
import { TemplateCard } from "@/components/invoices/template-card";
import { formatCurrency } from "@/lib/utils";

export default async function InvoiceTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const monthStart = startOfMonth(new Date());

  const [templates, clients, issuedThisMonth] = await Promise.all([
    prisma.invoiceTemplate.findMany({
      include: { client: true },
      orderBy: [{ active: "desc" }, { title: "asc" }],
    }),
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.invoice.findMany({
      where: {
        templateId: { not: null },
        issuedAt: { gte: monthStart },
      },
      select: { templateId: true, issuedAt: true, number: true },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const lastByTemplate = new Map<
    string,
    { issuedAt: Date; number: string }
  >();
  const issuedIdsThisMonth = new Set<string>();
  for (const invoice of issuedThisMonth) {
    if (!invoice.templateId) continue;
    issuedIdsThisMonth.add(invoice.templateId);
    if (!lastByTemplate.has(invoice.templateId)) {
      lastByTemplate.set(invoice.templateId, {
        issuedAt: invoice.issuedAt,
        number: invoice.number,
      });
    }
  }

  const olderIssued = await prisma.invoice.findMany({
    where: {
      templateId: {
        in: templates
          .map((template) => template.id)
          .filter((id) => !lastByTemplate.has(id)),
      },
    },
    select: { templateId: true, issuedAt: true, number: true },
    orderBy: { issuedAt: "desc" },
  });
  for (const invoice of olderIssued) {
    if (!invoice.templateId || lastByTemplate.has(invoice.templateId)) continue;
    lastByTemplate.set(invoice.templateId, {
      issuedAt: invoice.issuedAt,
      number: invoice.number,
    });
  }

  const visible = clientId
    ? templates.filter((template) => template.clientId === clientId)
    : templates;
  const active = templates.filter((template) => template.active);
  const monthlyTotal = active.reduce(
    (sum, template) => sum + template.quantity * template.unitPrice,
    0
  );
  const pendingThisMonth = active.filter(
    (template) => !issuedIdsThisMonth.has(template.id)
  ).length;

  const grouped = new Map<string, typeof visible>();
  for (const template of visible) {
    const list = grouped.get(template.client.name) ?? [];
    list.push(template);
    grouped.set(template.client.name, list);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/invoices"
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť na faktúry
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">Šablóny faktúr</h1>
          <p className="text-sm text-muted">
            Mesačné služby a opakované faktúry — upravíte raz, vystavíte jedným
            klikom.
          </p>
        </div>
        {pendingThisMonth > 0 && (
          <form action={issueActiveTemplatesThisMonth}>
            <Button type="submit">
              <Sparkles className="h-4 w-4" />
              Vystaviť všetky aktívne ({pendingThisMonth})
            </Button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Aktívne šablóny"
          value={String(active.length)}
          subtitle={`${templates.length} celkom`}
          icon={<Layers className="h-5 w-5" />}
        />
        <StatCard
          title="Mesačný objem"
          value={formatCurrency(monthlyTotal)}
          subtitle="Súčet aktívnych šablón"
          icon={<Wallet className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Čakajú tento mesiac"
          value={String(pendingThisMonth)}
          subtitle={
            pendingThisMonth === 0
              ? "Všetky aktívne už sú vystavené"
              : "Ešte nevystavené z aktívnych"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <form className="flex flex-wrap items-center gap-2">
            <Select
              name="clientId"
              defaultValue={clientId ?? ""}
              className="max-w-xs"
            >
              <option value="">Všetci klienti</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
            <Button type="submit" size="sm" variant="secondary">
              Filtrovať
            </Button>
            {clientId && (
              <Link href="/invoices/templates" className="text-xs text-muted hover:text-zinc-100">
                Zrušiť filter
              </Link>
            )}
          </form>

          {visible.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted">
                {templates.length === 0
                  ? "Zatiaľ žiadne šablóny. Vpravo pridajte napr. „Správa webu 30 € / mesiac“."
                  : "Pre tohto klienta zatiaľ nie je šablóna."}
              </CardContent>
            </Card>
          ) : (
            [...grouped.entries()].map(([clientName, list]) => (
              <div key={clientName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-300">{clientName}</h2>
                  <p className="text-xs text-muted">
                    {formatCurrency(
                      list
                        .filter((template) => template.active)
                        .reduce(
                          (sum, template) =>
                            sum + template.quantity * template.unitPrice,
                          0
                        )
                    )}{" "}
                    / mes.
                  </p>
                </div>
                {list.map((template) => {
                  const last = lastByTemplate.get(template.id);
                  return (
                    <TemplateCard
                      key={template.id}
                      clients={clients}
                      template={{
                        id: template.id,
                        title: template.title,
                        description: template.description,
                        quantity: template.quantity,
                        unit: template.unit,
                        unitPrice: template.unitPrice,
                        dueDays: template.dueDays,
                        active: template.active,
                        autoIssue: template.autoIssue,
                        clientId: template.clientId,
                        clientName: template.client.name,
                        lastIssuedAt: last ? last.issuedAt.toISOString() : null,
                        lastIssuedNumber: last?.number ?? null,
                        issuedThisMonth: issuedIdsThisMonth.has(template.id),
                      }}
                    />
                  );
                })}
              </div>
            ))
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle>Nová šablóna</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-sm text-muted">
                Najprv pridajte klienta v sekcii Klienti.
              </p>
            ) : (
              <InvoiceTemplateForm
                action={createInvoiceTemplate}
                clients={clients}
                showPresets
                initial={{ clientId }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
