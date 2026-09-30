import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateClient } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const action = updateClient.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/clients/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na klienta
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Upraviť klienta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <FormField label="Meno / Názov *" htmlFor="name">
              <Input id="name" name="name" required defaultValue={client.name} />
            </FormField>
            <FormField label="Firma" htmlFor="company">
              <Input id="company" name="company" defaultValue={client.company ?? ""} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={client.email ?? ""}
                />
              </FormField>
              <FormField label="Telefón" htmlFor="phone">
                <Input id="phone" name="phone" defaultValue={client.phone ?? ""} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="IČO" htmlFor="ico">
                <Input id="ico" name="ico" defaultValue={client.ico ?? ""} />
              </FormField>
              <FormField label="DIČ" htmlFor="dic">
                <Input id="dic" name="dic" defaultValue={client.dic ?? ""} />
              </FormField>
              <FormField label="IČ DPH" htmlFor="icDph">
                <Input id="icDph" name="icDph" defaultValue={client.icDph ?? ""} />
              </FormField>
            </div>
            <FormField label="Adresa" htmlFor="address">
              <Input id="address" name="address" defaultValue={client.address ?? ""} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="PSČ" htmlFor="zip">
                <Input id="zip" name="zip" defaultValue={client.zip ?? ""} />
              </FormField>
              <FormField label="Mesto" htmlFor="city">
                <Input id="city" name="city" defaultValue={client.city ?? ""} />
              </FormField>
            </div>
            <FormField label="Poznámky" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={3} defaultValue={client.notes ?? ""} />
            </FormField>
            <Button type="submit">Uložiť</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
