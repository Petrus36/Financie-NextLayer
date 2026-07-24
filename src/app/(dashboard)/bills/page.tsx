import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanUploadForm } from "@/components/bills/scan-upload-form";
import { BillPdfList } from "@/components/bills/bill-pdf-list";

export default async function BillsPage() {
  const bills = await prisma.bill.findMany({
    where: { fileName: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      vendor: true,
      title: true,
      fileName: true,
      billDate: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Doklady</h1>
        <p className="text-sm text-muted">
          Naskenujte faktúru alebo účtenku — uloží sa ako PDF na stiahnutie.
        </p>
      </div>

      <ScanUploadForm />

      <Card>
        <CardHeader>
          <CardTitle>Moje PDF ({bills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <BillPdfList bills={bills} />
        </CardContent>
      </Card>
    </div>
  );
}
