import { Suspense } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  FileText,
  Clock,
  AlertTriangle,
  CircleCheck,
} from "lucide-react";
import { getStatistics } from "@/lib/statistics";
import {
  parseStatisticsPeriod,
  getPeriodBounds,
  formatPeriodLabel,
  getChartTitle,
} from "@/lib/statistics-period";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { BreakdownList } from "@/components/dashboard/breakdown-list";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    view?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parseStatisticsPeriod(params);
  const { start, end } = getPeriodBounds(period);
  const stats = await getStatistics(period);

  const periodLabel = formatPeriodLabel(period, start, end);
  const chartTitle = getChartTitle(period, periodLabel, start, end);

  const year =
    period.mode === "month" || period.mode === "year"
      ? period.year
      : new Date().getFullYear();
  const month = period.mode === "month" ? period.month : undefined;
  const from = period.mode === "custom" ? params.from : undefined;
  const to = period.mode === "custom" ? params.to : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Štatistiky</h1>
          <p className="text-sm text-muted">Finančný prehľad — {periodLabel}</p>
        </div>
        <Suspense fallback={null}>
          <PeriodFilter
            basePath="/statistics"
            view={period.mode}
            year={year}
            month={month}
            from={from}
            to={to}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Príjmy"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Výdavky"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="h-5 w-5" />}
          trend="down"
        />
        <StatCard
          title="Čistý zisk"
          value={formatCurrency(stats.profit)}
          subtitle={stats.profit >= 0 ? "Kladný výsledok" : "Záporný výsledok"}
          icon={<DollarSign className="h-5 w-5" />}
          trend={stats.profit >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Marža"
          value={`${stats.margin.toFixed(1)} %`}
          subtitle="Zisk / príjmy"
          icon={<Percent className="h-5 w-5" />}
          trend={stats.margin >= 0 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Vystavené faktúry"
          value={formatCurrency(stats.invoiceIssuedTotal)}
          subtitle={`${stats.invoiceIssuedCount} v období`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Zaplatené faktúry"
          value={formatCurrency(stats.invoiceRevenue)}
          subtitle="Prišlo na účet"
          icon={<CircleCheck className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Nezaplatené"
          value={formatCurrency(stats.invoiceOutstanding)}
          subtitle={`${stats.unpaidInvoiceCount} otvorených`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Po splatnosti"
          value={formatCurrency(stats.invoiceOverdue)}
          subtitle={`${stats.invoiceOverdueCount} faktúr`}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={stats.invoiceOverdue > 0 ? "down" : "up"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{chartTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceChart data={stats.chartBreakdown} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Z čoho idú príjmy</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              total={stats.totalIncome}
              rows={[
                { label: "Projekty", value: stats.projectRevenue },
                { label: "Mesačná údržba", value: stats.maintenanceRevenue },
                { label: "Mesačné zákazky", value: stats.retainerRevenue },
                { label: "Zaplatené faktúry", value: stats.invoiceRevenue },
                { label: "Interné doklady", value: stats.internalDocumentIncome },
                { label: "Ostatné príjmy firmy", value: stats.firmIncomeTotal },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Z čoho idú výdavky</CardTitle>
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
        <CardHeader>
          <CardTitle>Výdavky firmy podľa kategórií</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.expenseByCategory.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              V tomto období zatiaľ nie sú výdavky firmy s kategóriou.
            </p>
          ) : (
            <BreakdownList
              total={stats.firmExpenseTotal}
              accent="red"
              totalLabel="Spolu výdavky firmy"
              rows={stats.expenseByCategory.map((row) => ({
                label: row.label,
                value: row.value,
                accent: "red" as const,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
