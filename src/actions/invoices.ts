"use server";

import { addDays, startOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCompanySettings, nextInvoiceNumber } from "@/lib/company";
import { invoiceItemsTotal } from "@/lib/invoices";
import type { InvoiceStatus } from "@/generated/prisma/client";

function revalidateFinance() {
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  revalidatePath("/income");
  revalidatePath("/celkove-financie");
  revalidatePath("/clients");
}

function parseItems(formData: FormData) {
  const descriptions = formData.getAll("itemDescription").map(String);
  const quantities = formData.getAll("itemQuantity").map(String);
  const units = formData.getAll("itemUnit").map(String);
  const prices = formData.getAll("itemUnitPrice").map(String);

  const items = descriptions
    .map((description, index) => ({
      description: description.trim(),
      quantity: parseFloat(quantities[index] || "1"),
      unit: (units[index] || "ks").trim() || "ks",
      unitPrice: parseFloat(prices[index] || "0"),
    }))
    .filter((item) => item.description && !isNaN(item.unitPrice));

  if (items.length === 0) {
    throw new Error("Pridajte aspoň jednu položku faktúry");
  }

  return items;
}

export async function createInvoice(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const projectId = String(formData.get("projectId") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const issuedAt = formData.get("issuedAt")
    ? new Date(String(formData.get("issuedAt")))
    : new Date();
  const dueAt = formData.get("dueAt")
    ? new Date(String(formData.get("dueAt")))
    : addDays(issuedAt, 14);

  if (!clientId) throw new Error("Vyberte klienta");

  const items = parseItems(formData);
  const total = invoiceItemsTotal(items);
  const requestedNumber = String(formData.get("number") ?? "").trim();
  const number = requestedNumber || (await nextInvoiceNumber());

  const existing = await prisma.invoice.findUnique({ where: { number } });
  if (existing) {
    throw new Error(`Faktúra s číslom ${number} už existuje`);
  }

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId,
      projectId,
      notes,
      issuedAt,
      dueAt,
      total,
      status: "DRAFT",
      items: { create: items },
    },
  });

  revalidateFinance();
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, formData: FormData) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.status === "PAID") {
    throw new Error("Zaplatenú faktúru už nie je možné upraviť");
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const requestedNumber = String(formData.get("number") ?? "").trim() || invoice.number;
  const issuedAt = formData.get("issuedAt")
    ? new Date(String(formData.get("issuedAt")))
    : invoice.issuedAt;
  const dueAt = formData.get("dueAt")
    ? new Date(String(formData.get("dueAt")))
    : invoice.dueAt;
  const items = parseItems(formData);

  if (requestedNumber !== invoice.number) {
    const taken = await prisma.invoice.findUnique({ where: { number: requestedNumber } });
    if (taken) {
      throw new Error(`Faktúra s číslom ${requestedNumber} už existuje`);
    }
  }

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        number: requestedNumber,
        notes,
        issuedAt,
        dueAt,
        total: invoiceItemsTotal(items),
        items: { create: items },
      },
    }),
  ]);

  revalidateFinance();
  revalidatePath(`/invoices/${id}`);
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, income: true },
  });
  if (!invoice) throw new Error("Faktúra neexistuje");

  if (status === "PAID") {
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: { status: "PAID", paidAt: invoice.paidAt ?? new Date() },
      });

      if (!invoice.income) {
        await tx.firmIncome.create({
          data: {
            description: `Faktúra ${invoice.number} — ${invoice.client.name}`,
            amount: invoice.total,
            category: "Faktúra",
            date: new Date(),
            invoiceId: invoice.id,
          },
        });
      }
    });
  } else {
    await prisma.$transaction(async (tx) => {
      if (invoice.income) {
        await tx.firmIncome.delete({ where: { id: invoice.income.id } });
      }
      await tx.invoice.update({
        where: { id },
        data: {
          status,
          paidAt: null,
        },
      });
    });
  }

  revalidateFinance();
  revalidatePath(`/invoices/${id}`);
  if (invoice.clientId) revalidatePath(`/clients/${invoice.clientId}`);
}

export async function deleteInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { income: true },
  });
  if (!invoice) return;
  if (invoice.income) {
    await prisma.firmIncome.delete({ where: { id: invoice.income.id } });
  }
  await prisma.invoice.delete({ where: { id } });
  revalidateFinance();
  redirect("/invoices");
}

export async function createInvoiceFromTemplate(templateId: string) {
  const template = await prisma.invoiceTemplate.findUnique({
    where: { id: templateId },
    include: { client: true },
  });
  if (!template) throw new Error("Šablóna neexistuje");

  const company = await getCompanySettings();
  const issuedAt = new Date();
  const dueAt = addDays(issuedAt, template.dueDays || company.defaultDueDays);
  const items = [
    {
      description: template.description || template.title,
      quantity: template.quantity,
      unit: template.unit,
      unitPrice: template.unitPrice,
    },
  ];

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      clientId: template.clientId,
      templateId: template.id,
      issuedAt,
      dueAt,
      total: invoiceItemsTotal(items),
      status: "DRAFT",
      items: { create: items },
    },
  });

  revalidateFinance();
  redirect(`/invoices/${invoice.id}`);
}

export async function createInvoiceTemplate(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const quantity = parseFloat(String(formData.get("quantity") ?? "1"));
  const unit = String(formData.get("unit") ?? "mes.").trim() || "mes.";
  const unitPrice = parseFloat(String(formData.get("unitPrice") ?? ""));
  const dueDays = parseInt(String(formData.get("dueDays") ?? "14"), 10);
  const autoIssue = formData.get("autoIssue") === "on";

  if (!clientId || !title || isNaN(unitPrice)) {
    throw new Error("Vyplňte klienta, názov a sumu");
  }

  await prisma.invoiceTemplate.create({
    data: {
      clientId,
      title,
      description,
      quantity: isNaN(quantity) ? 1 : quantity,
      unit,
      unitPrice,
      dueDays: isNaN(dueDays) ? 14 : dueDays,
      autoIssue,
      active: true,
    },
  });

  revalidatePath("/invoices/templates");
  revalidatePath(`/clients/${clientId}`);
}

export async function toggleInvoiceTemplate(id: string, active: boolean) {
  const template = await prisma.invoiceTemplate.update({
    where: { id },
    data: { active },
  });
  revalidatePath("/invoices/templates");
  revalidatePath(`/clients/${template.clientId}`);
}

export async function deleteInvoiceTemplate(id: string) {
  const template = await prisma.invoiceTemplate.delete({ where: { id } });
  revalidatePath("/invoices/templates");
  revalidatePath(`/clients/${template.clientId}`);
}

export async function updateInvoiceTemplate(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const quantity = parseFloat(String(formData.get("quantity") ?? "1"));
  const unit = String(formData.get("unit") ?? "mes.").trim() || "mes.";
  const unitPrice = parseFloat(String(formData.get("unitPrice") ?? ""));
  const dueDays = parseInt(String(formData.get("dueDays") ?? "14"), 10);
  const autoIssue = formData.get("autoIssue") === "on";
  const clientId = String(formData.get("clientId") ?? "");

  if (!title || isNaN(unitPrice)) {
    throw new Error("Vyplňte názov a sumu");
  }

  const template = await prisma.invoiceTemplate.update({
    where: { id },
    data: {
      clientId: clientId || undefined,
      title,
      description,
      quantity: isNaN(quantity) ? 1 : quantity,
      unit,
      unitPrice,
      dueDays: isNaN(dueDays) ? 14 : dueDays,
      autoIssue,
    },
  });

  revalidatePath("/invoices/templates");
  revalidatePath(`/clients/${template.clientId}`);
}

export async function duplicateInvoiceTemplate(id: string) {
  const template = await prisma.invoiceTemplate.findUnique({ where: { id } });
  if (!template) throw new Error("Šablóna neexistuje");

  await prisma.invoiceTemplate.create({
    data: {
      clientId: template.clientId,
      title: `${template.title} (kópia)`,
      description: template.description,
      quantity: template.quantity,
      unit: template.unit,
      unitPrice: template.unitPrice,
      dueDays: template.dueDays,
      autoIssue: template.autoIssue,
      active: true,
    },
  });

  revalidatePath("/invoices/templates");
  revalidatePath(`/clients/${template.clientId}`);
}

export async function issueActiveTemplatesThisMonth() {
  const monthStart = startOfMonth(new Date());
  const templates = await prisma.invoiceTemplate.findMany({
    where: { active: true },
    include: { client: true },
    orderBy: { title: "asc" },
  });

  const alreadyIssued = await prisma.invoice.findMany({
    where: {
      templateId: { in: templates.map((template) => template.id) },
      issuedAt: { gte: monthStart },
    },
    select: { templateId: true },
  });
  const issuedIds = new Set(alreadyIssued.map((invoice) => invoice.templateId));
  const company = await getCompanySettings();

  let created = 0;
  for (const template of templates) {
    if (issuedIds.has(template.id)) continue;

    const issuedAt = new Date();
    const items = [
      {
        description: template.description || template.title,
        quantity: template.quantity,
        unit: template.unit,
        unitPrice: template.unitPrice,
      },
    ];

    await prisma.invoice.create({
      data: {
        number: await nextInvoiceNumber(),
        clientId: template.clientId,
        templateId: template.id,
        issuedAt,
        dueAt: addDays(issuedAt, template.dueDays || company.defaultDueDays),
        total: invoiceItemsTotal(items),
        status: "DRAFT",
        items: { create: items },
      },
    });
    created += 1;
  }

  revalidateFinance();
  revalidatePath("/invoices/templates");
  redirect(created > 0 ? "/invoices" : "/invoices/templates");
}

export async function updateCompanySettings(formData: FormData) {
  await prisma.companySettings.upsert({
    where: { id: "main" },
    update: {
      name: String(formData.get("name") ?? "").trim() || "NextLayer Studio s.r.o.",
      ico: String(formData.get("ico") ?? "").trim() || null,
      dic: String(formData.get("dic") ?? "").trim() || null,
      icDph: String(formData.get("icDph") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      zip: String(formData.get("zip") ?? "").trim() || null,
      country: String(formData.get("country") ?? "").trim() || "Slovensko",
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      iban: String(formData.get("iban") ?? "").trim() || null,
      bic: String(formData.get("bic") ?? "").trim() || null,
      bankName: String(formData.get("bankName") ?? "").trim() || null,
      vatPayer: formData.get("vatPayer") === "on",
      defaultDueDays: parseInt(String(formData.get("defaultDueDays") ?? "14"), 10) || 14,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
    create: {
      id: "main",
      name: String(formData.get("name") ?? "").trim() || "NextLayer Studio s.r.o.",
    },
  });

  revalidatePath("/settings");
  revalidatePath("/invoices");
}
