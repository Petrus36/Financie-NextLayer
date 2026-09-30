import Link from "next/link";
import { Suspense } from "react";
import { Download, Plus, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { InvoiceListFilters } from "@/components/invoices/invoice-list-filters";
import { formatCurrency, formatDate } from "@/lib/utils";
import { displayInvoiceStatus, isInvoiceOverdue } from "@/lib/invoices";
import {
  parseStatisticsPeriod,
  getPeriodBounds,
  formatPeriodLabel,
} from "@/lib/statistics-period";
import { isWithinInterval } from "date-fns";

function matchesSearch(
  query: string | undefined,
  fields: (string | null | undefined)[]
) {
  if (!query?.trim()) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    year?: string;
    month?: string;
    from?: string;
    to?: string;
    status?: string;
    q?: string;
  }>;
}) {
  const raw = await searchParams;

  // Legacy ?month=2026-09
  let params = { ...raw };
  if (raw.month?.includes("-") && !raw.view && !raw.year) {
    const [y, m] = raw.month.split("-");
    if (y && m) {
      params = { ...params, view: "month", year: y, month: String(parseInt(m, 10)) };
    }
  }

  const period = parseStatisticsPeriod(params);
  const { start, end } = getPeriodBounds(period);
  const periodLabel = formatPeriodLabel(period, start, end);
  const statusFilter = params.status;
  const searchQuery = params.q;

  const year =
    period.mode === "month" || period.mode === "year"
      ? period.year
      : new Date().getFullYear();
  const month = period.mode === "month" ? period.month : undefined;
  const from = period.mode === "custom" ? params.from : undefined;
  const to = period.mode === "custom" ? params.to : undefined;

  const all = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { issuedAt: "desc" },
  });

  const invoices = all.filter((invoice) => {
    if (!isWithinInterval(invoice.issuedAt, { start, end })) return false;
    if (statusFilter === "OVERDUE") return isInvoiceOverdue(invoice);
    if (statusFilter && statusFilter !== "OVERDUE") {
      if (invoice.status !== statusFilter) return false;
    }
    return matchesSearch(searchQuery, [
      invoice.number,
      invoice.client.name,
      invoice.client.company,
    ]);
  });

  const unpaid = all.filter((i) => i.status === "SENT" || i.status === "DRAFT");
  const overdue = all.filter(isInvoiceOverdue);
  const paidInPeriod = all.filter(
    (i) =>
      i.status === "PAID" &&
      i.paidAt &&
      isWithinInterval(i.paidAt, { start, end })
  );
  const invoicedInPeriod = all
    .filter((i) => isWithinInterval(i.issuedAt, { start, end }))
    .reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Faktúry</h1>
          <p className="text-sm text-muted">
            {periodLabel}
            {searchQuery && ` · hľadanie: „${searchQuery}"`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices/templates">
            <Button variant="secondary">Šablóny</Button>
          </Link>
          <a href="/api/invoices/export">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </a>
          <Link href="/invoices/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nová faktúra
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Fakturované v období"
          value={formatCurrency(invoicedInPeriod)}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Zaplatené v období"
          value={formatCurrency(paidInPeriod.reduce((s, i) => s + i.total, 0))}
          trend="up"
        />
        <StatCard
          title="Nezaplatené"
          value={formatCurrency(unpaid.reduce((s, i) => s + i.total, 0))}
          subtitle={`${unpaid.length} faktúr celkom`}
        />
        <StatCard
          title="Po splatnosti"
          value={String(overdue.length)}
          trend={overdue.length > 0 ? "down" : "up"}
        />
      </div>

      <Suspense fallback={null}>
        <InvoiceListFilters
          view={period.mode === "custom" ? "custom" : period.mode}
          year={year}
          month={month}
          from={from}
          to={to}
          status={statusFilter}
          search={searchQuery}
        />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>
            Faktúry ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              V zvolenom období nie sú žiadne faktúry.{" "}
              <Link href="/invoices/new" className="text-brand hover:underline">
                Vystaviť novú
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => {
                const status = displayInvoiceStatus(invoice);
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-elevated/30"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-100">{invoice.number}</p>
                        <Badge variant={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {invoice.client.name} · vystavená {formatDate(invoice.issuedAt)}{" "}
                        · splatnosť {formatDate(invoice.dueAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-brand">
                      {formatCurrency(invoice.total)}
                    </p>
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
