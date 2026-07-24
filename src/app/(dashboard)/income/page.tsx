import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { createFirmIncome, deleteFirmIncome } from "@/actions/finance";
import {
  parseStatisticsPeriod,
  getPeriodBounds,
  formatPeriodLabel,
} from "@/lib/statistics-period";
import {
  incomeMatchesPeriod,
  matchesTextSearch,
  sumIncomesInPeriod,
} from "@/lib/finance-list-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { FinanceListFilters } from "@/components/dashboard/finance-list-filters";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    year?: string;
    month?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parseStatisticsPeriod(params);
  const { start, end } = getPeriodBounds(period);
  const periodLabel = formatPeriodLabel(period, start, end);
  const searchQuery = params.q;

  const year =
    period.mode === "month" || period.mode === "year"
      ? period.year
      : new Date().getFullYear();
  const month = period.mode === "month" ? period.month : undefined;
  const from = period.mode === "custom" ? params.from : undefined;
  const to = period.mode === "custom" ? params.to : undefined;

  const allIncomes = await prisma.firmIncome.findMany({
    orderBy: { date: "desc" },
  });

  const incomes = allIncomes.filter((income) => {
    if (!incomeMatchesPeriod(income, start, end)) return false;
    return matchesTextSearch(searchQuery, [
      income.description,
      income.category,
    ]);
  });

  const periodTotal = sumIncomesInPeriod(allIncomes, start, end);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Príjmy firmy</h1>
          <p className="text-sm text-zinc-400">
            {periodLabel} — {formatCurrency(periodTotal)}
            {searchQuery && ` · hľadanie: „${searchQuery}"`}
          </p>
        </div>
        <Suspense fallback={null}>
          <FinanceListFilters
            basePath="/income"
            view={period.mode}
            year={year}
            month={month}
            from={from}
            to={to}
            search={searchQuery}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Príjmy ({incomes.length}
                {incomes.length !== allIncomes.length
                  ? ` z ${allIncomes.length}`
                  : ""}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomes.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">
                  {searchQuery
                    ? "Žiadne príjmy pre zvolené filtre"
                    : "Zatiaľ žiadne príjmy v tomto období"}
                </p>
              ) : (
                <div className="space-y-2">
                  {incomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm text-zinc-200">
                          {income.description}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDate(income.date)}
                          {income.category && ` · ${income.category}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand">
                          +{formatCurrency(income.amount)}
                        </span>
                        <DeleteItemButton
                          id={income.id}
                          deleteAction={deleteFirmIncome}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pridať príjem</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createFirmIncome} className="space-y-3">
              <FormField label="Popis *" htmlFor="description">
                <Input
                  id="description"
                  name="description"
                  required
                  placeholder="Konzultácia, predaj..."
                />
              </FormField>
              <FormField label="Suma (€) *" htmlFor="amount">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="500.00"
                />
              </FormField>
              <FormField label="Kategória" htmlFor="category">
                <Input
                  id="category"
                  name="category"
                  placeholder="Konzultácia, licencia..."
                />
              </FormField>
              <FormField label="Dátum" htmlFor="date">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </FormField>
              <Button type="submit" className="w-full" variant="secondary">
                Pridať príjem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
