"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { PaymentFormFields } from "@/components/projects/payment-form-fields";

type AddTab = "payment" | "expense";

interface ProjectFinanceFormsProps {
  addPaymentAction: (formData: FormData) => Promise<void>;
  addExpenseAction: (formData: FormData) => Promise<void>;
}

export function ProjectFinanceForms({
  addPaymentAction,
  addExpenseAction,
}: ProjectFinanceFormsProps) {
  const [tab, setTab] = useState<AddTab>("payment");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="h-4 w-4 text-brand" />
          Pridať záznam
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex rounded-lg border border-border-strong bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("payment")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              tab === "payment"
                ? "bg-brand text-black"
                : "text-muted hover:text-zinc-100"
            )}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Platba
          </button>
          <button
            type="button"
            onClick={() => setTab("expense")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              tab === "expense"
                ? "bg-red-500 text-white"
                : "text-muted hover:text-zinc-100"
            )}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Výdavok
          </button>
        </div>

        {tab === "payment" ? (
          <form action={addPaymentAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <PaymentFormFields idPrefix="pay" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" className="min-w-[160px]">
                Zaznamenať platbu
              </Button>
            </div>
          </form>
        ) : (
          <form action={addExpenseAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Popis *" htmlFor="exp-description">
              <Input
                id="exp-description"
                name="description"
                required
                placeholder="Hosting, doména..."
              />
            </FormField>
            <FormField label="Suma (€) *" htmlFor="exp-amount">
              <Input
                id="exp-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="29.99"
              />
            </FormField>
            <FormField label="Kategória" htmlFor="exp-category">
              <Input id="exp-category" name="category" placeholder="Hosting, dizajn..." />
            </FormField>
            <FormField label="Dátum" htmlFor="exp-date">
              <Input
                id="exp-date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </FormField>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" variant="danger" className="min-w-[160px]">
                Pridať výdavok
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
