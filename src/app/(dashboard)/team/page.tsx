import Link from "next/link";
import { UsersRound, Plus, Landmark } from "lucide-react";
import { listTeamMembers, sumPaidToTeamMember } from "@/lib/team";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const members = await listTeamMembers();
  const activeCount = members.filter((m) => m.active).length;
  const withIban = members.filter((m) => m.iban).length;
  const paidTotal = members.reduce(
    (sum, member) => sum + sumPaidToTeamMember(member.firmExpenses),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tím</h1>
          <p className="text-sm text-muted">
            Ľudia, ktorým vyplácate — kontakty, IBAN a QR na rýchlu platbu
          </p>
        </div>
        <Link href="/team/new">
          <Button>
            <Plus className="h-4 w-4" />
            Pridať člena
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Členovia" value={String(activeCount)} subtitle={`${members.length} celkom`} />
        <StatCard title="S IBAN-om" value={String(withIban)} icon={<Landmark className="h-5 w-5" />} />
        <StatCard
          title="Vyplatené (výdavky)"
          value={formatCurrency(paidTotal)}
          trend="down"
        />
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UsersRound className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 text-sm text-muted">Zatiaľ žiadni členovia tímu.</p>
            <Link href="/team/new" className="mt-3 inline-block text-sm text-brand hover:underline">
              Pridať prvého
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const paid = sumPaidToTeamMember(member.firmExpenses);
            return (
              <Link key={member.id} href={`/team/${member.id}`}>
                <Card className="h-full transition-colors hover:border-brand/40">
                  <CardContent className="space-y-3 pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-zinc-100">{member.name}</p>
                        <p className="text-sm text-muted">{member.role || "Bez role"}</p>
                      </div>
                      <Badge variant={member.active ? "success" : "danger"}>
                        {member.active ? "Aktívny" : "Neaktívny"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted">
                      {member.email && <p>{member.email}</p>}
                      {member.phone && <p>{member.phone}</p>}
                      {member.iban ? (
                        <p className="font-mono text-zinc-300">
                          {member.iban.replace(/(.{4})/g, "$1 ").trim()}
                        </p>
                      ) : (
                        <p className="text-amber-400/90">Bez IBAN — doplňte pre QR</p>
                      )}
                    </div>
                    <p className="text-sm text-red-300">
                      Vyplatené: {formatCurrency(paid)}
                    </p>
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
