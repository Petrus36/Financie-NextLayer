import { prisma } from "@/lib/prisma";
import { createFirmIncome, deleteFirmIncome } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteItemButton } from "@/components/ui/delete-item-button";

export default async function IncomePage() {
  const incomes = await prisma.firmIncome.findMany({
    orderBy: { date: "desc" },
  });

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Príjmy firmy</h1>
        <p className="text-sm text-zinc-400">
          Celkové ostatné príjmy: {formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Všetky príjmy ({incomes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {incomes.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">
                  Zatiaľ žiadne ďalšie príjmy
                </p>
              ) : (
                <div className="space-y-2">
                  {incomes.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm text-zinc-200">{income.description}</p>
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
