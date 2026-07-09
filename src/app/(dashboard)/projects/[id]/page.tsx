import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectSummary } from "@/lib/statistics";
import { syncRetainerPeriods } from "@/lib/retainers";
import {
  addProjectExpense,
  addProjectPayment,
  deleteProjectExpense,
  deleteProjectPayment,
  deliverProject,
} from "@/actions/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeliverProjectForm } from "@/components/projects/deliver-form";
import { DeleteExpenseButton } from "@/components/projects/delete-expense-button";
import { DeletePaymentButton } from "@/components/projects/delete-payment-button";
import { ProjectFinanceForms } from "@/components/projects/project-finance-forms";
import { RetainerSection } from "@/components/retainers/retainer-section";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await syncRetainerPeriods({ projectId: id });
  const summary = await getProjectSummary(id);
  if (!summary) notFound();

  const { project, totalExpenses, totalPaid, remaining, profit, margin } = summary;
  const addExpenseAction = addProjectExpense.bind(null, id);
  const addPaymentAction = addProjectPayment.bind(null, id);

  return (
    <div className="space-y-6">
      <Link
        href={`/clients/${project.clientId}`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na {project.client.name}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{project.title}</h1>
            <Badge variant={project.status === "DELIVERED" ? "success" : "info"}>
              {project.status === "DELIVERED" ? "Odovzdaná" : "Aktívna"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">Klient: {project.client.name}</p>
          {project.description && (
            <p className="mt-2 text-sm text-muted">{project.description}</p>
          )}
          {project.deliveredAt && (
            <p className="mt-1 text-xs text-brand">
              Odovzdaná {formatDate(project.deliveredAt)}
            </p>
          )}
        </div>
        {project.status === "ACTIVE" && (
          <DeliverProjectForm
            projectId={id}
            remaining={remaining}
            deliverAction={deliverProject}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs text-muted">Celková cena</p>
          <p className="text-lg font-bold text-zinc-100 sm:text-xl">
            {formatCurrency(project.price)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Zaplatené</p>
          <p className="text-lg font-bold text-brand sm:text-xl">
            {formatCurrency(totalPaid)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Zostáva</p>
          <p
            className={`text-lg font-bold sm:text-xl ${remaining > 0 ? "text-amber-400" : "text-brand"}`}
          >
            {formatCurrency(remaining)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Výdavky</p>
          <p className="text-lg font-bold text-red-400 sm:text-xl">
            {formatCurrency(totalExpenses)}
          </p>
        </Card>
        <Card className="col-span-2 p-4 sm:col-span-1">
          <p className="text-xs text-muted">Očakávaný zisk</p>
          <p className="text-lg font-bold text-brand sm:text-xl">{formatCurrency(profit)}</p>
          <p className="text-xs text-muted">{margin.toFixed(1)}% marža</p>
        </Card>
      </div>

      {totalPaid > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Uhradené</span>
            <span>
              {Math.round((totalPaid / project.price) * 100)}% · {formatCurrency(totalPaid)} /{" "}
              {formatCurrency(project.price)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(100, (totalPaid / project.price) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <ProjectFinanceForms
        addPaymentAction={addPaymentAction}
        addExpenseAction={addExpenseAction}
      />

      <RetainerSection
        clientId={project.clientId}
        projectId={id}
        retainers={project.retainers}
        compact
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-brand/20 bg-brand-muted/30">
            <CardTitle className="text-brand">
              Platby · {formatCurrency(totalPaid)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {project.payments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Zatiaľ žiadne platby
              </p>
            ) : (
              <div className="space-y-2">
                {project.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-brand/20 bg-brand-muted/10 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {payment.description}
                      </p>
                      <p className="text-xs text-muted">{formatDate(payment.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-brand">
                        +{formatCurrency(payment.amount)}
                      </span>
                      <DeletePaymentButton
                        paymentId={payment.id}
                        projectId={id}
                        deleteAction={deleteProjectPayment}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-red-500/20 bg-red-500/5">
            <CardTitle className="text-red-400">
              Výdavky · {formatCurrency(totalExpenses)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {project.expenses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Zatiaľ žiadne výdavky</p>
            ) : (
              <div className="space-y-2">
                {project.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(expense.date)}
                        {expense.category && ` · ${expense.category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-red-400">
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

      {project.status === "DELIVERED" && (
        <Card className="border-brand/20 bg-brand-muted">
          <CardHeader>
            <CardTitle className="text-brand">Súhrn projektu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Celková cena</span>
              <span className="text-zinc-100">{formatCurrency(project.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Prijaté platby</span>
              <span className="text-brand">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Celkové výdavky</span>
              <span className="text-red-400">-{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="border-t border-brand/20 pt-2 flex justify-between">
              <span className="font-medium text-zinc-200">Čistý zisk</span>
              <span className="font-bold text-brand">{formatCurrency(profit)}</span>
            </div>
            {project.maintenance && (
              <div className="mt-3 rounded-lg border border-brand/20 p-3">
                <p className="text-xs text-muted">Mesačná údržba</p>
                <p className="text-sm font-medium text-brand">
                  {formatCurrency(project.maintenance.monthlyAmount)}/mes.
                  {project.maintenance.active ? "" : " (neaktívna)"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
