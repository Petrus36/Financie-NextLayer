"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface DeliverProjectFormProps {
  projectId: string;
  deliverAction: (projectId: string, formData: FormData) => Promise<void>;
}

export function DeliverProjectForm({
  projectId,
  deliverAction,
}: DeliverProjectFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [withMaintenance, setWithMaintenance] = useState(false);

  const action = deliverAction.bind(null, projectId);

  if (!showForm) {
    return (
      <Button variant="success" onClick={() => setShowForm(true)}>
        <CheckCircle className="h-4 w-4" />
        Odovzdať projekt
      </Button>
    );
  }

  return (
    <Card className="border-emerald-600/30">
      <CardHeader>
        <CardTitle className="text-emerald-400">Odovzdanie projektu</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={withMaintenance}
              onChange={(e) => setWithMaintenance(e.target.checked)}
              className="rounded border-zinc-600"
            />
            Klient bude platiť mesačnú údržbu
          </label>

          {withMaintenance && (
            <>
              <FormField label="Mesačná suma údržby (€)" htmlFor="maintenanceAmount">
                <Input
                  id="maintenanceAmount"
                  name="maintenanceAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="50.00"
                />
              </FormField>
              <FormField label="Poznámky k údržbe" htmlFor="maintenanceNotes">
                <Textarea
                  id="maintenanceNotes"
                  name="maintenanceNotes"
                  rows={2}
                  placeholder="Rozsah údržby..."
                />
              </FormField>
            </>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="success">
              <CheckCircle className="h-4 w-4" />
              Potvrdiť odovzdanie
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Zrušiť
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
