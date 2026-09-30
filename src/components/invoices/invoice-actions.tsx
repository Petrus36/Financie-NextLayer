"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send, RotateCcw, Trash2 } from "lucide-react";
import { deleteInvoice, setInvoiceStatus } from "@/actions/invoices";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/generated/prisma/client";

export function InvoiceActions({
  id,
  status,
  clientEmail,
  number,
}: {
  id: string;
  status: InvoiceStatus;
  clientEmail?: string | null;
  number: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "DRAFT" && (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => setInvoiceStatus(id, "SENT"))}
        >
          <Send className="h-4 w-4" />
          Označiť ako odoslanú
        </Button>
      )}

      {status !== "PAID" && status !== "CANCELLED" && (
        <Button
          size="sm"
          variant="primary"
          disabled={pending}
          onClick={() => run(() => setInvoiceStatus(id, "PAID"))}
        >
          <CheckCircle2 className="h-4 w-4" />
          Zaplatená
        </Button>
      )}

      {status === "PAID" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => run(() => setInvoiceStatus(id, "SENT"))}
        >
          <RotateCcw className="h-4 w-4" />
          Zrušiť úhradu
        </Button>
      )}

      {clientEmail && status !== "CANCELLED" && (
        <a
          href={`mailto:${clientEmail}?subject=${encodeURIComponent(
            `Faktúra ${number} — NextLayer Studio`
          )}&body=${encodeURIComponent(
            `Dobrý deň,\n\nv prílohe posielame faktúru č. ${number}.\nĎakujeme.\n\nNextLayer Studio s.r.o.`
          )}`}
        >
          <Button size="sm" variant="secondary" type="button">
            <Send className="h-4 w-4" />
            Otvoriť e-mail
          </Button>
        </a>
      )}

      {status !== "PAID" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          className="text-red-400"
          onClick={() => {
            if (!confirm("Naozaj zmazať túto faktúru?")) return;
            run(() => deleteInvoice(id));
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
