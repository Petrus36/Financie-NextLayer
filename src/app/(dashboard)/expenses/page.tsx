import { prisma } from "@/lib/prisma";
import {
  createFirmExpense,
  toggleFirmExpense,
  deleteFirmExpense,
} from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { ToggleActiveButton } from "@/components/ui/toggle-active-button";

export default async function ExpensesPage() {
  const expenses = await prisma.firmExpense.findMany({
    orderBy: { createdAt: "desc" },
  });

  const monthlyTotal = expenses
    .filter((e) => e.type === "MONTHLY" && e.active)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Výdavky firmy</h1>
        <p className="text-sm text-zinc-400">
          Mesačné fixné náklady: {formatCurrency(monthlyTotal)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Všetky výdavky ({expenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">
                  Zatiaľ žiadne výdavky firmy
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
                          <p className="text-sm text-zinc-200">{expense.description}</p>
                          <Badge
                            variant={
                              expense.type === "MONTHLY" ? "warning" : "default"
                            }
                          >
                            {expense.type === "MONTHLY" ? "Mesačne" : "Jednorazovo"}
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
