import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na klientov
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nový klient</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createClient} className="space-y-4">
            <FormField label="Meno / Názov *" htmlFor="name">
              <Input id="name" name="name" required placeholder="Jan Novák" />
            </FormField>
            <FormField label="Firma" htmlFor="company">
              <Input id="company" name="company" placeholder="Novák s.r.o." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jan@example.com"
                />
              </FormField>
              <FormField label="Telefón" htmlFor="phone">
                <Input id="phone" name="phone" placeholder="+421 900 000 000" />
              </FormField>
            </div>
            <FormField label="Poznámky" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={3} placeholder="Voliteľné poznámky..." />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/clients">
                <Button type="button" variant="secondary">
                  Zrušiť
                </Button>
              </Link>
              <Button type="submit">Vytvoriť klienta</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
