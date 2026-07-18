import { CreditCard, Banknote, Wallet, Scale } from "lucide-react";
import { getOverallFinances } from "@/lib/firm-balance";
import { updateFirmBalance } from "@/actions/finance";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function OverallFinancesPage() {
  const { balance, totalLiquid, recorded, difference } = await getOverallFinances();

  const lastUpdated = new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(balance.updatedAt);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Celkové financie</h1>
        <p className="text-sm text-muted">
          Skutočný stav na účte a v hotovosti — porovnajte s bankou
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Na karte / účte"
          value={formatCurrency(balance.cardAmount)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="V hotovosti"
          value={formatCurrency(balance.cashAmount)}
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          title="Spolu disponibilné"
          value={formatCurrency(totalLiquid)}
          subtitle="Karta + hotovosť"
          icon={<Wallet className="h-5 w-5" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktualizovať stav</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted">
              Zadajte sumy podľa výpisu z banky alebo fyzického stavu peňaženky.
              Naposledy upravené: {lastUpdated}
            </p>
            <form action={updateFirmBalance} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Na karte / bankovom účte (€) *" htmlFor="cardAmount">
                  <Input
                    id="cardAmount"
                    name="cardAmount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={balance.cardAmount}
                  />
                </FormField>
                <FormField label="V hotovosti (€) *" htmlFor="cashAmount">
                  <Input
                    id="cashAmount"
                    name="cashAmount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={balance.cashAmount}
                  />
                </FormField>
              </div>
              <FormField label="Poznámka (voliteľné)" htmlFor="notes">
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="napr. Revolut + Tatra banka, hotovosť v trezore..."
                  defaultValue={balance.notes ?? ""}
                />
              </FormField>
              <Button type="submit">Uložiť stav</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-brand/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-brand" />
              Kontrola so systémom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted">
              Porovnanie skutočného stavu so zaznamenanými transakciami v aplikácii
              (platby projektov, príjmy a výdavky).
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Zaznamenané príjmy</span>
              <span className="text-brand">{formatCurrency(recorded.totalIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Zaznamenané výdavky</span>
              <span className="text-red-400">
                -{formatCurrency(recorded.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-zinc-300">Teoretický zostatok v systéme</span>
              <span className="font-medium text-zinc-100">
                {formatCurrency(recorded.netRecorded)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-zinc-300">Skutočný stav (karta + hotovosť)</span>
              <span className="font-medium text-zinc-100">
                {formatCurrency(totalLiquid)}
              </span>
            </div>
            <div
              className={`rounded-lg p-3 text-sm ${
                Math.abs(difference) < 1
                  ? "bg-brand-muted text-brand"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              <p className="font-medium">
                {Math.abs(difference) < 1
                  ? "✓ Súhlasí so systémom"
                  : `Rozdiel: ${difference > 0 ? "+" : ""}${formatCurrency(difference)}`}
              </p>
              <p className="mt-1 text-xs opacity-80">
                {Math.abs(difference) < 1
                  ? "Stav peňazí zodpovedá záznamom v aplikácii."
                  : "Rozdiel môže byť spôsobený mesačnými platbami, nezaznamenanými položkami alebo počiatočným zostatkom."}
              </p>
            </div>
            {recorded.monthlyRecurring > 0 && (
              <p className="text-xs text-muted">
                Aktívne mesačné príjmy (údržba + zákazky):{" "}
                {formatCurrency(recorded.monthlyRecurring)}/mes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
