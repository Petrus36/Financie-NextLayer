import Link from "next/link";
import { notFound } from "next/navigation";
import { startOfMonth } from "date-fns";
import { ArrowLeft, Plus, Mail, Phone, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { syncRetainerPeriods, mapRetainersForDisplay } from "@/lib/retainers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RetainerSection } from "@/components/retainers/retainer-section";
import { createRetainer } from "@/actions/finance";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await syncRetainerPeriods({ clientId: id });

  const monthStart = startOfMonth(new Date());

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: { expenses: true, payments: true, maintenance: true },
        orderBy: { createdAt: "desc" },
      },
      maintenance: { where: { active: true }, include: { project: true } },
      retainers: {
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
        include: {
          deliveries: {
            where: { date: { gte: monthStart } },
            select: { amount: true },
          },
        },
      },
    },
  });

  if (!client) notFound();

  const createRetainerAction = createRetainer.bind(null, id, null);

  const totalRevenue = client.projects.reduce((s, p) => s + p.price, 0);
  const totalExpenses = client.projects.reduce(
    (s, p) => s + p.expenses.reduce((es, e) => es + e.amount, 0),
    0
  );

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na klientov
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{client.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            {client.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {client.company}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {client.phone}
              </span>
            )}
          </div>
          {client.notes && (
            <p className="mt-2 text-sm text-muted">{client.notes}</p>
          )}
        </div>
        <Link href={`/clients/${id}/projects/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Nová zakázka
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted">Celková hodnota</p>
          <p className="text-xl font-bold text-zinc-100">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Výdavky na projekty</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">Zisk z klienta</p>
          <p className="text-xl font-bold text-brand">
            {formatCurrency(totalRevenue - totalExpenses)}
          </p>
        </Card>
      </div>

      {client.maintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aktívna mesačná údržba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {client.maintenance.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">{m.project.title}</p>
                  <p className="text-xs text-muted">Od {formatDate(m.startDate)}</p>
                </div>
                <p className="text-sm font-medium text-brand">
                  {formatCurrency(m.monthlyAmount)}/mes.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <RetainerSection
        retainers={mapRetainersForDisplay(client.retainers)}
        createAction={createRetainerAction}
      />

      <Card>
        <CardHeader>
          <CardTitle>Zakázky ({client.projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {client.projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">
              Zatiaľ žiadne zakázky.{" "}
              <Link
                href={`/clients/${id}/projects/new`}
                className="text-brand hover:underline"
              >
                Vytvoriť prvú
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {client.projects.map((project) => {
                const expenses = project.expenses.reduce((s, e) => s + e.amount, 0);
                const paid = project.payments.reduce((s, p) => s + p.amount, 0);
                const profit = project.price - expenses;

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-elevated/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-100">{project.title}</p>
                        <Badge
                          variant={
                            project.status === "DELIVERED" ? "success" : "info"
                          }
                        >
                          {project.status === "DELIVERED" ? "Odovzdaná" : "Aktívna"}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="mt-1 text-xs text-muted line-clamp-1">
                          {project.description}
                        </p>
                      )}
                      {paid > 0 && paid < project.price && (
                        <p className="mt-1 text-xs text-amber-400">
                          Zaplatené {formatCurrency(paid)} / {formatCurrency(project.price)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-100">
                        {formatCurrency(project.price)}
                      </p>
                      <p className="text-xs text-brand">
                        Zisk: {formatCurrency(profit)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
