import { Suspense } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Wrench,
} from "lucide-react";
import { getStatistics, getDashboardOverview } from "@/lib/statistics";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { FinanceChart } from "@/components/dashboard/finance-chart";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();
  const month = params.month ? parseInt(params.month) : undefined;

  const [stats, overview] = await Promise.all([
    getStatistics({ year, month }),
    getDashboardOverview(),
  ]);

  const periodLabel = month
    ? new Intl.DateTimeFormat("sk-SK", { month: "long", year: "numeric" }).format(
        new Date(year, month - 1)
      )
    : String(year);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Prehľad</h1>
          <p className="text-sm text-zinc-400">Finančný prehľad — {periodLabel}</p>
        </div>
        <Suspense fallback={null}>
          <PeriodFilter year={year} month={month} />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Klienti"
          value={String(overview.clientCount)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Aktívne zakázky"
          value={String(overview.activeProjects)}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          title="Príjmy z projektov"
          value={formatCurrency(stats.projectRevenue)}
          subtitle={`+ ${formatCurrency(stats.maintenanceRevenue)} údržba`}
        />
        <StatCard
          title="Ostatné príjmy"
          value={formatCurrency(stats.firmIncomeTotal)}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      {stats.monthlyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mesačný prehľad — {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceChart data={stats.monthlyBreakdown} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rozdelenie príjmov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Projekty (odovzdané)</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.projectRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Mesačná údržba</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.maintenanceRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Ostatné príjmy firmy</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.firmIncomeTotal)}
              </span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Spolu</span>
              <span className="text-sm font-bold text-emerald-400">
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
              <span className="text-sm text-zinc-400">Výdavky na projekty</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.projectExpenseTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Výdavky firmy</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(stats.firmExpenseTotal)}
              </span>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Spolu</span>
              <span className="text-sm font-bold text-red-400">
                {formatCurrency(stats.totalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.recentDelivered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nedávno odovzdané projekty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentDelivered.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 p-3 transition-colors hover:bg-zinc-800/30"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{project.title}</p>
                    <p className="text-xs text-zinc-500">{project.client.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">
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
