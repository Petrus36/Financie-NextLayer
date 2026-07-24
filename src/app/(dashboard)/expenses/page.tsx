import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  createFirmExpense,
  toggleFirmExpense,
  deleteFirmExpense,
} from "@/actions/finance";
import {
  parseStatisticsPeriod,
  getPeriodBounds,
  formatPeriodLabel,
} from "@/lib/statistics-period";
import {
  expenseMatchesPeriod,
  matchesTextSearch,
  sumExpensesInPeriod,
} from "@/lib/finance-list-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { ToggleActiveButton } from "@/components/ui/toggle-active-button";
import { FinanceListFilters } from "@/components/dashboard/finance-list-filters";
import type { ExpenseType } from "@/generated/prisma/client";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    year?: string;
    month?: string;
    from?: string;
    to?: string;
    q?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parseStatisticsPeriod(params);
  const { start, end } = getPeriodBounds(period);
  const periodLabel = formatPeriodLabel(period, start, end);
  const searchQuery = params.q;
  const typeFilter = params.type as ExpenseType | undefined;

  const year =
    period.mode === "month" || period.mode === "year"
      ? period.year
      : new Date().getFullYear();
  const month = period.mode === "month" ? period.month : undefined;
  const from = period.mode === "custom" ? params.from : undefined;
  const to = period.mode === "custom" ? params.to : undefined;

  const allExpenses = await prisma.firmExpense.findMany({
    orderBy: { date: "desc" },
  });

  const expenses = allExpenses.filter((expense) => {
    if (!expenseMatchesPeriod(expense, start, end)) return false;
    if (typeFilter && expense.type !== typeFilter) return false;
    if (
      !matchesTextSearch(searchQuery, [
        expense.description,
        expense.category,
      ])
    ) {
      return false;
    }
    return true;
  });

  const periodTotal = sumExpensesInPeriod(allExpenses, start, end);
  const monthlyTotal = allExpenses
    .filter((e) => e.type === "MONTHLY" && e.active)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Výdavky firmy</h1>
          <p className="text-sm text-zinc-400">
            {periodLabel} — {formatCurrency(periodTotal)}
            {searchQuery && ` · hľadanie: „${searchQuery}"`}
          </p>
          <p className="mt-1 text-xs text-muted">
            Mesačné fixné náklady: {formatCurrency(monthlyTotal)}
          </p>
        </div>
        <Suspense fallback={null}>
          <FinanceListFilters
            basePath="/expenses"
            view={period.mode}
            year={year}
            month={month}
            from={from}
            to={to}
            search={searchQuery}
            typeFilter={typeFilter}
            showTypeFilter
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Výdavky ({expenses.length}
                {expenses.length !== allExpenses.length
                  ? ` z ${allExpenses.length}`
                  : ""}
                )
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">
                  {searchQuery || typeFilter
                    ? "Žiadne výdavky pre zvolené filtre"
                    : "Zatiaľ žiadne výdavky firmy v tomto období"}
                </p>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-zinc-200">
                            {expense.description}
                          </p>
                          <Badge
                            variant={
                              expense.type === "MONTHLY" ? "warning" : "default"
                            }
                          >
                            {expense.type === "MONTHLY"
                              ? "Mesačne"
                              : "Jednorazovo"}
                          </Badge>
                          {expense.type === "MONTHLY" && !expense.active && (
                            <Badge variant="danger">Neaktívne</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {formatDate(expense.date)}
                          {expense.category && ` · ${expense.category}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-400">
                          -{formatCurrency(expense.amount)}
                          {expense.type === "MONTHLY" && "/mes."}
                        </span>
                        {expense.type === "MONTHLY" && (
                          <ToggleActiveButton
                            id={expense.id}
                            active={expense.active}
                            toggleAction={toggleFirmExpense}
                          />
                        )}
                        <DeleteItemButton
                          id={expense.id}
                          deleteAction={deleteFirmExpense}
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
            <CardTitle>Pridať výdavok</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createFirmExpense} className="space-y-3">
              <FormField label="Popis *" htmlFor="description">
                <Input
                  id="description"
                  name="description"
                  required
                  placeholder="Kancelária, software..."
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
                  placeholder="99.00"
                />
              </FormField>
              <FormField label="Typ *" htmlFor="type">
                <Select id="type" name="type" defaultValue="ONE_TIME">
                  <option value="ONE_TIME">Jednorazový</option>
                  <option value="MONTHLY">Mesačný (opakujúci sa)</option>
                </Select>
              </FormField>
              <FormField label="Kategória" htmlFor="category">
                <Input
                  id="category"
                  name="category"
                  placeholder="Nájom, software..."
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
                Pridať výdavok
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
