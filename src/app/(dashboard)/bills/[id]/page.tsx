import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { billHasFile, getBillDisplayTitle } from "@/lib/bills";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function BillPdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bill = await prisma.bill.findUnique({ where: { id } });

  if (!bill || !billHasFile(bill)) notFound();

  const title = getBillDisplayTitle(bill);

  return (
    <div className="space-y-4">
      <Link
        href="/bills"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na doklady
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
          <p className="text-sm text-muted">{bill.fileName}</p>
        </div>
        <a href={`/api/bills/${id}/file?download=1`} download>
          <Button variant="primary">
            <Download className="h-4 w-4" />
            Stiahnuť PDF
          </Button>
        </a>
      </div>

      <Card>
        <CardContent className="p-0">
          <iframe
            src={`/api/bills/${id}/file`}
            title={title}
            className="h-[75vh] w-full rounded-xl bg-white"
          />
        </CardContent>
      </Card>
    </div>
  );
}
