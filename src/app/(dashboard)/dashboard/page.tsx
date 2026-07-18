import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Wrench,
} from "lucide-react";
import { getStatistics, getDashboardOverview } from "@/lib/statistics";
import { getCurrentMonthFilter, getPeriodBounds, formatPeriodLabel } from "@/lib/statistics-period";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          title="Klienti celkom"
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
          subtitle={`+ ${formatCurrency(stats.maintenanceRevenue + stats.retainerRevenue)} mesačne`}
        />
        <StatCard
          title="Ostatné príjmy"
          value={formatCurrency(stats.firmIncomeTotal)}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Príjmy — {periodLabel}</CardTitle>
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
            <CardTitle>Výdavky — {periodLabel}</CardTitle>
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
