import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createManagedProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_STAGE_LABEL, PROJECT_STAGES } from "@/lib/projects";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na projekty
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nový projekt</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="space-y-3 text-sm text-muted">
              <p>Najprv pridajte klienta.</p>
              <Link href="/clients/new">
                <Button>Nový klient</Button>
              </Link>
            </div>
          ) : (
            <form action={createManagedProject} className="space-y-4">
              <FormField label="Klient" htmlFor="clientId">
                <Select id="clientId" name="clientId" required defaultValue={clientId ?? ""}>
                  <option value="" disabled>
                    Vyberte klienta
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                      {client.company ? ` · ${client.company}` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Názov" htmlFor="title">
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Reels kampaň, web, spot..."
                />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Cena (€)" htmlFor="price">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1500"
                  />
                </FormField>
                <FormField label="Deadline" htmlFor="deadline">
                  <Input id="deadline" name="deadline" type="date" />
                </FormField>
              </div>
              <FormField label="Fáza" htmlFor="stage">
                <Select id="stage" name="stage" defaultValue="IN_PROGRESS">
                  {PROJECT_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {PROJECT_STAGE_LABEL[stage]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Popis" htmlFor="description">
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Čo sa má dodať, rozsah, poznámky..."
                />
              </FormField>
              <div className="flex justify-end gap-3">
                <Link href="/projects">
                  <Button type="button" variant="secondary">
                    Zrušiť
                  </Button>
                </Link>
                <Button type="submit">Vytvoriť projekt</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
