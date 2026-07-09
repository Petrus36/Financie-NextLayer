import { Suspense } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Wrench,
} from "lucide-react";
import { getStatistics } from "@/lib/statistics";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { FinanceChart } from "@/components/dashboard/finance-chart";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; view?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const view = params.view === "year" ? "year" : "month";
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month =
    view === "month"
      ? params.month
        ? parseInt(params.month)
        : now.getMonth() + 1
      : undefined;

  const stats = await getStatistics({ year, month });

  const periodLabel =
    view === "month" && month
      ? new Intl.DateTimeFormat("sk-SK", {
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1))
      : String(year);

  const chartTitle =
    view === "month"
      ? `Denný vývoj — ${periodLabel}`
      : `Mesačný vývoj — ${year}`;

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
            year={year}
            month={month}
            view={view}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Celkové príjmy"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Celkové výdavky"
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
          title="Odovzdané projekty"
          value={String(stats.deliveredProjectsCount)}
          subtitle={`${stats.activeMaintenanceCount} aktívnych údržieb`}
          icon={<Briefcase className="h-5 w-5" />}
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
            <CardTitle>Rozdelenie príjmov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Projekty (odovzdané)</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.projectRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Mesačná údržba</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.maintenanceRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Mesačné zákazky</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.retainerRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Ostatné príjmy firmy</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.firmIncomeTotal)}
              </span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Spolu</span>
              <span className="text-sm font-bold text-brand">
                {formatCurrency(stats.totalIncome)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rozdelenie výdavkov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Výdavky na projekty</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.projectExpenseTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Výdavky firmy</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.firmExpenseTotal)}
              </span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Spolu</span>
              <span className="text-sm font-bold text-red-400">
                {formatCurrency(stats.totalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted">
            <Briefcase className="h-4 w-4" />
            <p className="text-xs">Príjmy z projektov</p>
          </div>
          <p className="mt-2 text-xl font-bold text-brand">
            {formatCurrency(stats.projectRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted">
            <Wrench className="h-4 w-4" />
            <p className="text-xs">Mesačná údržba</p>
          </div>
          <p className="mt-2 text-xl font-bold text-brand">
            {formatCurrency(stats.maintenanceRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted">
            <Briefcase className="h-4 w-4" />
            <p className="text-xs">Mesačné zákazky</p>
          </div>
          <p className="mt-2 text-xl font-bold text-brand">
            {formatCurrency(stats.retainerRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted">
            <TrendingUp className="h-4 w-4" />
            <p className="text-xs">Ostatné príjmy</p>
          </div>
          <p className="mt-2 text-xl font-bold text-brand">
            {formatCurrency(stats.firmIncomeTotal)}
          </p>
        </Card>
      </div>
    </div>
  );
}
