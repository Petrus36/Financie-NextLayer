import Link from "next/link";
import { Plus, Mail, Phone, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      projects: true,
      maintenance: { where: { active: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Klienti</h1>
          <p className="text-sm text-zinc-400">{clients.length} klientov celkom</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            Pridať klienta
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-400">Zatiaľ nemáte žiadnych klientov.</p>
            <Link href="/clients/new" className="mt-4 inline-block">
              <Button variant="secondary">Pridať prvého klienta</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => {
            const activeProjects = client.projects.filter(
              (p) => p.status === "ACTIVE"
            ).length;
            const totalValue = client.projects.reduce((s, p) => s + p.price, 0);
            const maintenanceTotal = client.maintenance.reduce(
              (s, m) => s + m.monthlyAmount,
              0
            );

            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="transition-all hover:border-violet-600/50 hover:shadow-lg hover:shadow-violet-600/5">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-zinc-100">{client.name}</h3>
                        {client.company && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                            <Building2 className="h-3 w-3" />
                            {client.company}
                          </p>
                        )}
                      </div>
                      <Badge variant={activeProjects > 0 ? "info" : "default"}>
                        {activeProjects} aktívnych
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      {client.email && (
                        <p className="flex items-center gap-2 text-xs text-zinc-400">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p className="flex items-center gap-2 text-xs text-zinc-400">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                      <div>
                        <p className="text-xs text-zinc-500">Hodnota projektov</p>
                        <p className="text-sm font-medium text-zinc-200">
                          {formatCurrency(totalValue)}
                        </p>
                      </div>
                      {maintenanceTotal > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-zinc-500">Údržba/mes.</p>
                          <p className="text-sm font-medium text-emerald-400">
                            {formatCurrency(maintenanceTotal)}
                          </p>
                        </div>
                      )}
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
