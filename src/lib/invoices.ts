import type { InvoiceStatus } from "@/generated/prisma/client";

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Koncept",
  SENT: "Odoslaná",
  PAID: "Zaplatená",
  CANCELLED: "Zrušená",
};

export function isInvoiceOverdue(invoice: {
  status: InvoiceStatus;
  dueAt: Date;
}) {
  return invoice.status === "SENT" && new Date(invoice.dueAt) < new Date();
}

export function displayInvoiceStatus(invoice: {
  status: InvoiceStatus;
  dueAt: Date;
}): { label: string; tone: "default" | "warning" | "info" | "success" | "danger" } {
  if (isInvoiceOverdue(invoice)) {
    return { label: "Po splatnosti", tone: "danger" };
  }
  switch (invoice.status) {
    case "PAID":
      return { label: invoiceStatusLabels.PAID, tone: "success" };
    case "SENT":
      return { label: invoiceStatusLabels.SENT, tone: "info" };
    case "CANCELLED":
      return { label: invoiceStatusLabels.CANCELLED, tone: "default" };
    default:
      return { label: invoiceStatusLabels.DRAFT, tone: "warning" };
  }
}

export function lineTotal(quantity: number, unitPrice: number) {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function invoiceItemsTotal(
  items: { quantity: number; unitPrice: number }[]
) {
  return items.reduce((sum, item) => sum + lineTotal(item.quantity, item.unitPrice), 0);
}

export function formatInvoiceNumber(year: number, sequence: number) {
  return `${year}${String(sequence).padStart(3, "0")}`;
}

export function toDateInput(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}
