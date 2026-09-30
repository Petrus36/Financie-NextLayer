import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProjectStage } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  isClosedStage,
  listManagedProjects,
  PROJECT_STAGE_LABEL,
  PROJECT_STAGES,
  projectFinance,
} from "@/lib/projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function stageBadge(stage: ProjectStage) {
  if (stage === "DELIVERED") return "success" as const;
  if (stage === "CANCELLED") return "danger" as const;
  if (stage === "PAUSED" || stage === "REVIEW") return "warning" as const;
  return "info" as const;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const selected = PROJECT_STAGES.includes(stage as ProjectStage)
    ? (stage as ProjectStage)
    : null;

  const projects = await listManagedProjects();
  const visible = selected
    ? projects.filter((project) => project.stage === selected)
    : projects.filter((project) => !isClosedStage(project.stage));

  const open = projects.filter((project) => !isClosedStage(project.stage));
  const totals = open.reduce(
    (acc, project) => {
      const finance = projectFinance(project);
      acc.price += project.price;
      acc.received += finance.received;
      acc.costs += finance.costs;
      acc.realized += finance.realized;
      return acc;
    },
    { price: 0, received: 0, costs: 0, realized: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Projekty</h1>
          <p className="text-sm text-muted">
            Zakázky, ľudia, výplaty a plus / mínus na jednom mieste
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nový projekt
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Otvorené" value={String(open.length)} />
        <StatCard
          title="Cena otvorených"
          value={formatCurrency(totals.price)}
        />
        <StatCard
          title="Prijaté"
          value={formatCurrency(totals.received)}
          trend="up"
        />
        <StatCard
          title="Realizovaný zisk"
          value={formatCurrency(totals.realized)}
          trend={totals.realized >= 0 ? "up" : "down"}
          subtitle="Platby mínus náklady a výplaty"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/projects"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            !selected
              ? "border-brand bg-brand text-black"
              : "border-border text-muted hover:text-zinc-100"
          )}
        >
          Otvorené
        </Link>
        {PROJECT_STAGES.map((item) => (
          <Link
            key={item}
            href={`/projects?stage=${item}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              selected === item
                ? "border-brand bg-brand text-black"
                : "border-border text-muted hover:text-zinc-100"
            )}
          >
            {PROJECT_STAGE_LABEL[item]}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted">Žiadne projekty v tomto filtri.</p>
            <Link href="/projects/new" className="mt-4 inline-block">
              <Button variant="secondary">Vytvoriť projekt</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((project) => {
            const finance = projectFinance(project);
            const doneTasks = project.tasks.filter((task) => task.done).length;
            const overdue =
              project.deadline &&
              !isClosedStage(project.stage) &&
              new Date(project.deadline) < new Date();

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-all hover:border-brand/50">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-zinc-100">{project.title}</h2>
                        <p className="text-xs text-muted">
                          {project.client.name}
                          {project.client.company ? ` · ${project.client.company}` : ""}
                        </p>
                      </div>
                      <Badge variant={stageBadge(project.stage)}>
                        {PROJECT_STAGE_LABEL[project.stage]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted">Prijaté</p>
                        <p className="font-medium text-brand">
                          {formatCurrency(finance.received)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Náklady</p>
                        <p className="font-medium text-red-400">
                          {formatCurrency(finance.costs)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Plus / mínus</p>
                        <p
                          className={cn(
                            "font-medium",
                            finance.realized >= 0 ? "text-brand" : "text-red-400"
                          )}
                        >
                          {finance.realized >= 0 ? "+" : ""}
                          {formatCurrency(finance.realized)}
                        </p>
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${Math.min(100, finance.collectPct)}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span>{project.members.length} ľudí</span>
                      <span>
                        Úlohy {doneTasks}/{project.tasks.length}
                      </span>
                      {project.deadline && (
                        <span className={overdue ? "text-amber-400" : undefined}>
                          Deadline {formatDate(project.deadline)}
                        </span>
                      )}
                      <span>Cena {formatCurrency(project.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
