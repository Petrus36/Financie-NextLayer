import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  FileText,
} from "lucide-react";
import { getStatistics, getDashboardOverview } from "@/lib/statistics";
import { getCurrentMonthFilter, getPeriodBounds, formatPeriodLabel } from "@/lib/statistics-period";
import { formatCurrency, formatDate } from "@/lib/utils";
import { displayInvoiceStatus } from "@/lib/invoices";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { BreakdownList } from "@/components/dashboard/breakdown-list";
import Link from "next/link";

export default async function DashboardPage() {
  const filter = getCurrentMonthFilter();
  const { start, end } = getPeriodBounds(filter);
  const periodLabel = formatPeriodLabel(filter, start, end);

  const [stats, overview] = await Promise.all([
    getStatistics(filter),
    getDashboardOverview(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Prehľad</h1>
        <p className="text-sm text-muted">
          Aktuálny mesiac — {periodLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Príjmy tento mesiac"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Výdavky tento mesiac"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
        />
        <StatCard
          title="Zisk tento mesiac"
          value={formatCurrency(stats.profit)}
          subtitle={`Marža ${stats.margin.toFixed(1)} %`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={stats.profit >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Nezaplatené faktúry"
          value={formatCurrency(overview.unpaidTotal)}
          subtitle={`${overview.unpaidInvoices.length} otvorených`}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Klienti celkom"
          value={String(overview.clientCount)}
          icon={<Users className="h-5 w-5" />}
        />
        <Link href="/projects">
          <StatCard
            title="Aktívne zakázky"
            value={String(overview.activeProjects)}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </Link>
        <StatCard
          title="Zaplatené faktúry"
          value={formatCurrency(stats.invoiceRevenue)}
          subtitle={`${stats.invoiceIssuedCount} vystavených tento mesiac`}
        />
        <StatCard
          title="Odovzdané projekty"
          value={String(stats.deliveredProjectsCount)}
          subtitle={`${stats.activeMaintenanceCount} aktívnych údržieb`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vývoj — {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceChart data={stats.chartBreakdown} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Príjmy — {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              total={stats.totalIncome}
              rows={[
                { label: "Projekty", value: stats.projectRevenue },
                { label: "Mesačná údržba", value: stats.maintenanceRevenue },
                { label: "Mesačné zákazky", value: stats.retainerRevenue },
                { label: "Zaplatené faktúry", value: stats.invoiceRevenue },
                { label: "Ostatné príjmy firmy", value: stats.firmIncomeTotal },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Výdavky — {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              total={stats.totalExpenses}
              accent="red"
              rows={[
                {
                  label: "Výdavky na projekty",
                  value: stats.projectExpenseTotal,
                  accent: "red",
                },
                {
                  label: "Výdavky firmy",
                  value: stats.firmExpenseTotal,
                  accent: "red",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Čakajúce faktúry
            {overview.unpaidTotal > 0 ? ` · ${formatCurrency(overview.unpaidTotal)}` : ""}
          </CardTitle>
          <Link href="/invoices" className="text-sm text-brand hover:underline">
            Všetky
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {overview.unpaidInvoices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm text-muted">Žiadne otvorené faktúry.</p>
              <Link
                href="/invoices/new"
                className="mt-2 inline-block text-sm text-brand hover:underline"
              >
                Vystaviť faktúru
              </Link>
            </div>
          ) : (
            overview.unpaidInvoices.map((invoice) => {
              const status = displayInvoiceStatus(invoice);
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-elevated/30"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {invoice.number} · {invoice.client.name}
                    </p>
                    <p className="text-xs text-muted">
                      Splatnosť {formatDate(invoice.dueAt)}
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
            })
          )}
        </CardContent>
      </Card>

      {stats.recentDelivered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Odovzdané tento mesiac</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentDelivered.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-surface-elevated/30"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{project.title}</p>
                    <p className="text-xs text-muted">{project.client.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-brand">
                      {formatCurrency(project.price)}
                    </p>
                    <Badge variant="success">Odovzdaná</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
