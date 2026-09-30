import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectSummary } from "@/lib/statistics";
import { syncRetainerPeriods, mapRetainersForDisplay } from "@/lib/retainers";
import {
  addProjectExpense,
  addProjectPayment,
  createRetainer,
  deleteProjectExpense,
  deleteProjectPayment,
  deliverProject,
} from "@/actions/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DeliverProjectForm } from "@/components/projects/deliver-form";
import { DeleteExpenseButton } from "@/components/projects/delete-expense-button";
import { DeletePaymentButton } from "@/components/projects/delete-payment-button";
import { ProjectFinanceForms } from "@/components/projects/project-finance-forms";
import { ProjectStageBar } from "@/components/projects/project-stage-bar";
import { ProjectPeopleSection } from "@/components/projects/project-people-section";
import { ProjectTasksSection } from "@/components/projects/project-tasks-section";
import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { RetainerSection } from "@/components/retainers/retainer-section";
import { PROJECT_STAGE_LABEL, isClosedStage } from "@/lib/projects";
import { displayInvoiceStatus } from "@/lib/invoices";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await syncRetainerPeriods({ projectId: id });
  const summary = await getProjectSummary(id);
  if (!summary) notFound();

  const {
    project,
    totalExpenses,
    totalPayouts,
    totalPaid,
    remaining,
    costs,
    profit,
    realized,
    margin,
  } = summary;
  const addExpenseAction = addProjectExpense.bind(null, id);
  const addPaymentAction = addProjectPayment.bind(null, id);
  const createRetainerAction = createRetainer.bind(null, project.clientId, id);
  const overdue =
    project.deadline &&
    !isClosedStage(project.stage) &&
    new Date(project.deadline) < new Date();

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na projekty
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{project.title}</h1>
            <Badge variant={project.stage === "DELIVERED" ? "success" : "info"}>
              {PROJECT_STAGE_LABEL[project.stage]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Klient:{" "}
            <Link href={`/clients/${project.clientId}`} className="text-brand hover:underline">
              {project.client.name}
            </Link>
          </p>
          {project.description && (
            <p className="mt-2 text-sm text-muted">{project.description}</p>
          )}
          {project.deadline && (
            <p className={cn("mt-1 text-xs", overdue ? "text-amber-400" : "text-muted")}>
              Deadline {formatDate(project.deadline)}
              {overdue ? " · po termíne" : ""}
            </p>
          )}
          {project.deliveredAt && (
            <p className="mt-1 text-xs text-brand">
              Odovzdaný {formatDate(project.deliveredAt)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invoices/new?clientId=${project.clientId}`}>
            <Button variant="secondary">Nová faktúra</Button>
          </Link>
          {project.status === "ACTIVE" && (
            <DeliverProjectForm
              projectId={id}
              remaining={remaining}
              deliverAction={deliverProject}
            />
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <p className="text-xs text-muted">Fáza projektu</p>
          <ProjectStageBar projectId={id} current={project.stage} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4">
          <p className="text-xs text-muted">Cena</p>
          <p className="text-lg font-bold text-zinc-100">{formatCurrency(project.price)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Prijaté</p>
          <p className="text-lg font-bold text-brand">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Zostáva od klienta</p>
          <p className={`text-lg font-bold ${remaining > 0 ? "text-amber-400" : "text-brand"}`}>
            {formatCurrency(remaining)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Výdavky</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Výplaty ľuďom</p>
          <p className="text-lg font-bold text-amber-300">{formatCurrency(totalPayouts)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Plus / mínus</p>
          <p className={`text-lg font-bold ${realized >= 0 ? "text-brand" : "text-red-400"}`}>
            {realized >= 0 ? "+" : ""}
            {formatCurrency(realized)}
          </p>
          <p className="text-xs text-muted">
            Očakávaný {formatCurrency(profit)} · {margin.toFixed(0)}%
          </p>
        </Card>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted">
          <span>Uhradené od klienta</span>
          <span>
            {Math.round(project.price > 0 ? (totalPaid / project.price) * 100 : 0)}% ·{" "}
            {formatCurrency(totalPaid)} / {formatCurrency(project.price)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{
              width: `${Math.min(100, project.price > 0 ? (totalPaid / project.price) * 100 : 0)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ProjectTasksSection projectId={id} tasks={project.tasks} />
          <ProjectFinanceForms
            addPaymentAction={addPaymentAction}
            addExpenseAction={addExpenseAction}
          />
        </div>
        <ProjectEditForm project={project} />
      </div>

      <ProjectPeopleSection projectId={id} members={project.members} />

      <RetainerSection
        retainers={mapRetainersForDisplay(project.retainers)}
        createAction={createRetainerAction}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-brand/20 bg-brand-muted/30">
            <CardTitle className="text-brand">Platby · {formatCurrency(totalPaid)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {project.payments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Zatiaľ žiadne platby</p>
            ) : (
              <div className="space-y-2">
                {project.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-brand/20 bg-brand-muted/10 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{payment.description}</p>
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
                      <p className="text-sm font-medium text-zinc-200">{expense.description}</p>
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

      {project.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Faktúry k projektu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.invoices.map((invoice) => {
              const status = displayInvoiceStatus(invoice);
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-elevated/30"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{invoice.number}</p>
                    <p className="text-xs text-muted">{formatDate(invoice.issuedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.tone}>{status.label}</Badge>
                    <span className="text-sm font-medium text-zinc-100">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="border-brand/20 bg-brand-muted">
        <CardHeader>
          <CardTitle className="text-brand">Súhrn plus / mínus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Cena projektu</span>
            <span className="text-zinc-100">{formatCurrency(project.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Prijaté platby</span>
            <span className="text-brand">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Výdavky</span>
            <span className="text-red-400">-{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Výplaty ľuďom</span>
            <span className="text-amber-300">-{formatCurrency(totalPayouts)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Náklady spolu</span>
            <span className="text-red-400">-{formatCurrency(costs)}</span>
          </div>
          <div className="flex justify-between border-t border-brand/20 pt-2">
            <span className="font-medium text-zinc-200">Realizovaný zisk</span>
            <span className={cn("font-bold", realized >= 0 ? "text-brand" : "text-red-400")}>
              {formatCurrency(realized)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Očakávaný zisk po doplatení</span>
            <span className="text-zinc-100">{formatCurrency(profit)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
