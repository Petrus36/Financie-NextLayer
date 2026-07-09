import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProjectSummary } from "@/lib/statistics";
import {
  addProjectExpense,
  deleteProjectExpense,
  deliverProject,
} from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeliverProjectForm } from "@/components/projects/deliver-form";
import { DeleteExpenseButton } from "@/components/projects/delete-expense-button";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const summary = await getProjectSummary(id);
  if (!summary) notFound();

  const { project, totalExpenses, profit, margin } = summary;
  const addExpenseAction = addProjectExpense.bind(null, id);

  return (
    <div className="space-y-6">
      <Link
        href={`/clients/${project.clientId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na {project.client.name}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{project.title}</h1>
            <Badge variant={project.status === "DELIVERED" ? "success" : "info"}>
              {project.status === "DELIVERED" ? "Odovzdaná" : "Aktívna"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Klient: {project.client.name}
          </p>
          {project.description && (
            <p className="mt-2 text-sm text-zinc-500">{project.description}</p>
          )}
          {project.deliveredAt && (
            <p className="mt-1 text-xs text-emerald-400">
              Odovzdaná {formatDate(project.deliveredAt)}
            </p>
          )}
        </div>
        {project.status === "ACTIVE" && (
          <DeliverProjectForm projectId={id} deliverAction={deliverProject} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Cena projektu</p>
          <p className="text-xl font-bold text-zinc-100">
            {formatCurrency(project.price)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Výdavky</p>
          <p className="text-xl font-bold text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Zisk</p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(profit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Marža</p>
          <p className="text-xl font-bold text-violet-400">
            {margin.toFixed(1)}%
          </p>
        </Card>
      </div>

      {project.status === "DELIVERED" && (
        <Card className="border-emerald-600/20 bg-emerald-600/5">
          <CardHeader>
            <CardTitle className="text-emerald-400">Súhrn projektu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Fakturovaná suma</span>
              <span className="text-zinc-100">{formatCurrency(project.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Celkové výdavky</span>
              <span className="text-red-400">-{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="border-t border-emerald-600/20 pt-2 flex justify-between">
              <span className="font-medium text-zinc-200">Čistý zisk</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(profit)}
              </span>
            </div>
            {project.maintenance && (
              <div className="mt-3 rounded-lg border border-emerald-600/20 p-3">
                <p className="text-xs text-zinc-500">Mesačná údržba</p>
                <p className="text-sm font-medium text-emerald-400">
                  {formatCurrency(project.maintenance.monthlyAmount)}/mes.
                  {project.maintenance.active ? "" : " (neaktívna)"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Výdavky projektu ({project.expenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {project.expenses.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-400">
                  Zatiaľ žiadne výdavky
                </p>
              ) : (
                <div className="space-y-2">
                  {project.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"
                    >
                      <div>
                        <p className="text-sm text-zinc-200">{expense.description}</p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(expense.date)}
                          {expense.category && ` · ${expense.category}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-400">
                          -{formatCurrency(expense.amount)}
                        </span>
                        <DeleteExpenseButton
                          expenseId={expense.id}
                          projectId={id}
                          deleteAction={deleteProjectExpense}
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
            <form action={addExpenseAction} className="space-y-3">
              <FormField label="Popis *" htmlFor="description">
                <Input
                  id="description"
                  name="description"
                  required
                  placeholder="Hosting, doména..."
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
                  placeholder="29.99"
                />
              </FormField>
              <FormField label="Kategória" htmlFor="category">
                <Input
                  id="category"
                  name="category"
                  placeholder="Hosting, dizajn..."
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
