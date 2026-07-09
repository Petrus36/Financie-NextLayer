import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  const createProjectAction = createProject.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/clients/${id}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na {client.name}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nová zakázka — {client.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProjectAction} className="space-y-4">
            <FormField label="Názov zakázky *" htmlFor="title">
              <Input
                id="title"
                name="title"
                required
                placeholder="Webová stránka, branding..."
              />
            </FormField>
            <FormField label="Cena projektu (€) *" htmlFor="price">
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="1500.00"
              />
            </FormField>
            <FormField label="Popis" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Detaily projektu..."
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Link href={`/clients/${id}`}>
                <Button type="button" variant="secondary">
                  Zrušiť
                </Button>
              </Link>
              <Button type="submit">Vytvoriť zakázku</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
