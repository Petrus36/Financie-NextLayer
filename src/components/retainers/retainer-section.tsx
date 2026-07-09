import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { createRetainer } from "@/actions/finance";
import { RetainerCard, RetainerData } from "@/components/retainers/retainer-card";
import { Repeat } from "lucide-react";

interface RetainerSectionProps {
  clientId: string;
  projectId?: string;
  retainers: RetainerData[];
  compact?: boolean;
}

export function RetainerSection({
  clientId,
  projectId,
  retainers,
  compact,
}: RetainerSectionProps) {
  const createAction = createRetainer.bind(null, clientId, projectId ?? null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-brand" />
          Mesačné zákazky ({retainers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted">
          Opakujúca sa mesačná spolupráca — napr. 600 €/mes. za 6 marketingových videí.
        </p>

        {retainers.length > 0 && (
          <div className={compact ? "space-y-3" : "grid gap-3 sm:grid-cols-2"}>
            {retainers.map((r) => (
              <RetainerCard key={r.id} retainer={r} />
            ))}
          </div>
        )}

        <form
          action={createAction}
          className="rounded-lg border border-border border-dashed p-4"
        >
          <p className="mb-3 text-sm font-medium text-zinc-200">Nová mesačná zákazka</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Názov *" htmlFor="ret-title">
              <Input
                id="ret-title"
                name="title"
                required
                placeholder="Marketing videá"
              />
            </FormField>
            <FormField label="Suma / mesiac (€) *" htmlFor="ret-amount">
              <Input
                id="ret-amount"
                name="monthlyAmount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="600"
              />
            </FormField>
            <FormField label="Počet / mesiac *" htmlFor="ret-target">
              <Input
                id="ret-target"
                name="targetCount"
                type="number"
                min="1"
                required
                placeholder="6"
              />
            </FormField>
            <FormField label="Jednotka (videí, príspevkov...)" htmlFor="ret-label">
              <Input
                id="ret-label"
                name="deliverableLabel"
                defaultValue="videí"
                placeholder="videí"
              />
            </FormField>
          </div>
          <Button type="submit" className="mt-3" variant="secondary" size="sm">
            Pridať mesačnú zákazku
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
