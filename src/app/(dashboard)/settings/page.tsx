import { getCompanySettings } from "@/lib/company";
import { updateCompanySettings } from "@/actions/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";

export default async function SettingsPage() {
  const company = await getCompanySettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Nastavenia firmy</h1>
        <p className="text-sm text-muted">
          Tieto údaje sa použijú na faktúrach ako dodávateľ.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NextLayer Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCompanySettings} className="space-y-4">
            <FormField label="Názov firmy *" htmlFor="name">
              <Input id="name" name="name" required defaultValue={company.name} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="IČO" htmlFor="ico">
                <Input id="ico" name="ico" defaultValue={company.ico ?? ""} />
              </FormField>
              <FormField label="DIČ" htmlFor="dic">
                <Input id="dic" name="dic" defaultValue={company.dic ?? ""} />
              </FormField>
              <FormField label="IČ DPH" htmlFor="icDph">
                <Input id="icDph" name="icDph" defaultValue={company.icDph ?? ""} />
              </FormField>
            </div>
            <FormField label="Adresa" htmlFor="address">
              <Input
                id="address"
                name="address"
                defaultValue={company.address ?? ""}
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="PSČ" htmlFor="zip">
                <Input id="zip" name="zip" defaultValue={company.zip ?? ""} />
              </FormField>
              <FormField label="Mesto" htmlFor="city">
                <Input id="city" name="city" defaultValue={company.city ?? ""} />
              </FormField>
              <FormField label="Krajina" htmlFor="country">
                <Input
                  id="country"
                  name="country"
                  defaultValue={company.country}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={company.email ?? ""}
                />
              </FormField>
              <FormField label="Telefón" htmlFor="phone">
                <Input id="phone" name="phone" defaultValue={company.phone ?? ""} />
              </FormField>
            </div>
            <FormField label="Web" htmlFor="website">
              <Input
                id="website"
                name="website"
                defaultValue={company.website ?? ""}
                placeholder="nextlayer.studio"
              />
            </FormField>
            <FormField label="IBAN" htmlFor="iban">
              <Input id="iban" name="iban" defaultValue={company.iban ?? ""} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="BIC / SWIFT" htmlFor="bic">
                <Input id="bic" name="bic" defaultValue={company.bic ?? ""} />
              </FormField>
              <FormField label="Banka" htmlFor="bankName">
                <Input
                  id="bankName"
                  name="bankName"
                  defaultValue={company.bankName ?? ""}
                />
              </FormField>
            </div>
            <FormField label="Predvolená splatnosť (dni)" htmlFor="defaultDueDays">
              <Input
                id="defaultDueDays"
                name="defaultDueDays"
                type="number"
                min="1"
                defaultValue={company.defaultDueDays}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="vatPayer"
                defaultChecked={company.vatPayer}
                className="accent-brand"
              />
              Sme platca DPH
            </label>
            <FormField label="Poznámka na faktúre" htmlFor="notes">
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={company.notes ?? ""}
                placeholder="Ďakujeme za spoluprácu."
              />
            </FormField>
            <Button type="submit">Uložiť nastavenia</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
