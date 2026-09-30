import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { displayInvoiceStatus } from "@/lib/invoices";

export const dynamic = "force-dynamic";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { issuedAt: "desc" },
  });

  const header = [
    "Číslo",
    "Klient",
    "Vystavená",
    "Splatnosť",
    "Suma",
    "Stav",
    "Zaplatená",
  ];

  const rows = invoices.map((invoice) => [
    invoice.number,
    invoice.client.name,
    formatDate(invoice.issuedAt),
    formatDate(invoice.dueAt),
    formatCurrency(invoice.total),
    displayInvoiceStatus(invoice).label,
    invoice.paidAt ? formatDate(invoice.paidAt) : "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="faktury.csv"`,
    },
  });
}
