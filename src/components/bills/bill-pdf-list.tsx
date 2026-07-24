"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Download, Eye, FileText, Trash2 } from "lucide-react";
import { deleteBill } from "@/actions/bills";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getBillDisplayTitle } from "@/lib/bills";

export type BillListItem = {
  id: string;
  vendor: string;
  title: string | null;
  fileName: string | null;
  billDate: Date;
};

export function BillPdfList({ bills }: { bills: BillListItem[] }) {
  if (bills.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted" />
        <p className="mt-3 text-sm text-muted">Zatiaľ žiadne PDF doklady</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bills.map((bill) => (
        <BillPdfRow key={bill.id} bill={bill} />
      ))}
    </div>
  );
}

function BillPdfRow({ bill }: { bill: BillListItem }) {
  const [pending, startTransition] = useTransition();
  const title = getBillDisplayTitle(bill);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-elevated/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-zinc-100">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {bill.fileName} · {formatDate(bill.billDate)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/bills/${bill.id}`}>
          <Button size="sm" variant="secondary">
            <Eye className="h-4 w-4" />
            Otvoriť PDF
          </Button>
        </Link>
        <a href={`/api/bills/${bill.id}/file?download=1`} download>
          <Button size="sm" variant="primary">
            <Download className="h-4 w-4" />
            Stiahnuť
          </Button>
        </a>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!confirm("Zmazať tento PDF doklad?")) return;
            startTransition(() => deleteBill(bill.id));
          }}
          className="text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
