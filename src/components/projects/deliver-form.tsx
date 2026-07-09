"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DeliverProjectFormProps {
  projectId: string;
  remaining: number;
  deliverAction: (projectId: string, formData: FormData) => Promise<void>;
}

export function DeliverProjectForm({
  projectId,
  remaining,
  deliverAction,
}: DeliverProjectFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [withMaintenance, setWithMaintenance] = useState(false);
  const [withPayment, setWithPayment] = useState(remaining > 0);

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
    <Card className="border-brand/30">
      <CardHeader>
        <CardTitle className="text-brand">Odovzdanie projektu</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {remaining > 0 && (
            <>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={withPayment}
                  onChange={(e) => setWithPayment(e.target.checked)}
                  className="rounded border-border-strong accent-brand"
                />
                Zaznamenať platbu pri odovzdaní
                {remaining > 0 && (
                  <span className="text-muted">
                    (zostáva {formatCurrency(remaining)})
                  </span>
                )}
              </label>
              {withPayment && (
                <FormField label="Suma platby pri odovzdaní (€)" htmlFor="deliveryPayment">
                  <Input
                    id="deliveryPayment"
                    name="deliveryPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={remaining > 0 ? remaining.toFixed(2) : ""}
                    placeholder="1500.00"
                  />
                </FormField>
              )}
            </>
          )}

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={withMaintenance}
              onChange={(e) => setWithMaintenance(e.target.checked)}
              className="rounded border-border-strong accent-brand"
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
