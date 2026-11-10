import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Landmark } from "lucide-react";
import { getTeamMember, sumPaidToTeamMember } from "@/lib/team";
import {
  deleteTeamMember,
  setTeamMemberActive,
  updateTeamMember,
} from "@/actions/team";
import { TeamMemberForm } from "@/components/team/team-member-form";
import { TeamPaymentQr } from "@/components/team/team-payment-qr";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMember(id);
  if (!member) notFound();

  const paid = sumPaidToTeamMember(member.firmExpenses);
  const updateAction = updateTeamMember.bind(null, id);
  const activateAction = setTeamMemberActive.bind(null, id, true);
  const deactivateAction = setTeamMemberActive.bind(null, id, false);
  const removeAction = deleteTeamMember.bind(null, id);

  return (
    <div className="space-y-6">
      <Link
        href="/team"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na tím
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-100">{member.name}</h1>
            <Badge variant={member.active ? "success" : "danger"}>
              {member.active ? "Aktívny" : "Neaktívny"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{member.role || "Bez role"}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
            {member.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {member.email}
              </span>
            )}
            {member.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {member.phone}
              </span>
            )}
          </div>
          {member.notes && <p className="mt-2 text-sm text-muted">{member.notes}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/expenses?teamMemberId=${id}`}>
            <Button>Zaznamenať výplatu</Button>
          </Link>
          <form action={member.active ? deactivateAction : activateAction}>
            <Button type="submit" variant="secondary">
              {member.active ? "Deaktivovať" : "Aktivovať"}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Vyplatené cez výdavky" value={formatCurrency(paid)} trend="down" />
        <StatCard
          title="Bankové údaje"
          value={member.iban ? "Pripravené" : "Chýba IBAN"}
          subtitle={member.bankName || member.bic || "Doplňte IBAN pre QR"}
          icon={<Landmark className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>QR platba</CardTitle>
          </CardHeader>
          <CardContent>
            {member.iban ? (
              <TeamPaymentQr name={member.name} iban={member.iban} bic={member.bic} />
            ) : (
              <p className="py-8 text-center text-sm text-muted">
                Najprv uložte IBAN v formulári vpravo — potom sa tu zobrazí QR.
              </p>
            )}
            {member.iban && (
              <div className="mt-4 space-y-1 text-sm text-muted">
                <p className="font-mono text-zinc-200">
                  {member.iban.replace(/(.{4})/g, "$1 ").trim()}
                </p>
                {member.bic && <p>BIC: {member.bic}</p>}
                {member.bankName && <p>{member.bankName}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upraviť údaje</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMemberForm
              action={updateAction}
              submitLabel="Uložiť zmeny"
              initial={member}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Výplaty / výdavky</CardTitle>
          <Link href={`/expenses?teamMemberId=${id}`} className="text-sm text-brand hover:underline">
            Nový výdavok
          </Link>
        </CardHeader>
        <CardContent>
          {member.firmExpenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Zatiaľ žiadne výdavky priradené tomuto členovi.
            </p>
          ) : (
            <div className="space-y-2">
              {member.firmExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{expense.description}</p>
                    <p className="text-xs text-muted">
                      {formatDate(expense.date)}
                      {expense.category ? ` · ${expense.category}` : ""}
                      {expense.client ? ` · klient ${expense.client.name}` : ""}
                      {expense.type === "MONTHLY" ? " · mesačne" : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-red-400">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Odstrániť</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted">
            Výdavky zostanú v histórii firmy; iba väzba na člena sa zruší. Dáta klientov a
            faktúr sa nemenia.
          </p>
          <form action={removeAction}>
            <Button type="submit" variant="danger">
              Odstrániť člena
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
