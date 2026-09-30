"use server";

import { startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { retainerUnitAmount } from "@/lib/retainers";
import { normalizeExpenseCategory } from "@/lib/expense-categories";
import { adjustFirmCashInTransaction } from "@/lib/firm-balance";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseClientFields(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) {
    throw new Error("Meno klienta je povinné");
  }

  return {
    name: name.trim(),
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    company: (formData.get("company") as string) || null,
    notes: (formData.get("notes") as string) || null,
    ico: String(formData.get("ico") ?? "").trim() || null,
    dic: String(formData.get("dic") ?? "").trim() || null,
    icDph: String(formData.get("icDph") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    zip: String(formData.get("zip") ?? "").trim() || null,
  };
}

export async function createClient(formData: FormData) {
  const client = await prisma.client.create({
    data: parseClientFields(formData),
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  await prisma.client.update({
    where: { id },
    data: parseClientFields(formData),
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  revalidatePath("/invoices");
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function createProject(clientId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const price = parseFloat(formData.get("price") as string);

  if (!title?.trim() || isNaN(price)) {
    throw new Error("Názov a cena sú povinné");
  }

  const project = await prisma.project.create({
    data: {
      title: title.trim(),
      description,
      price,
      clientId,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function addProjectExpense(projectId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || null;
  const dateStr = formData.get("date") as string;

  if (!description?.trim() || isNaN(amount)) {
    throw new Error("Popis a suma sú povinné");
  }

  await prisma.projectExpense.create({
    data: {
      description: description.trim(),
      amount,
      category,
      date: dateStr ? new Date(dateStr) : new Date(),
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function deleteProjectExpense(expenseId: string, projectId: string) {
  await prisma.projectExpense.delete({ where: { id: expenseId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function addProjectPayment(projectId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dateStr = formData.get("date") as string;

  if (!description?.trim() || isNaN(amount) || amount <= 0) {
    throw new Error("Popis a suma sú povinné");
  }

  await prisma.projectPayment.create({
    data: {
      description: description.trim(),
      amount,
      date: dateStr ? new Date(dateStr) : new Date(),
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function deleteProjectPayment(paymentId: string, projectId: string) {
  await prisma.projectPayment.delete({ where: { id: paymentId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function deliverProject(projectId: string, formData: FormData) {
  const maintenanceAmount = formData.get("maintenanceAmount") as string;
  const maintenanceNotes = (formData.get("maintenanceNotes") as string) || null;
  const deliveryPayment = formData.get("deliveryPayment") as string;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: "DELIVERED",
      stage: "DELIVERED",
      deliveredAt: new Date(),
    },
  });

  if (deliveryPayment && parseFloat(deliveryPayment) > 0) {
    await prisma.projectPayment.create({
      data: {
        description: "Odovzdanie projektu",
        amount: parseFloat(deliveryPayment),
        date: new Date(),
        projectId: project.id,
      },
    });
  }

  if (maintenanceAmount && parseFloat(maintenanceAmount) > 0) {
    await prisma.maintenanceContract.create({
      data: {
        monthlyAmount: parseFloat(maintenanceAmount),
        notes: maintenanceNotes,
        clientId: project.clientId,
        projectId: project.id,
      },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath(`/clients/${project.clientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function createFirmExpense(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as "ONE_TIME" | "MONTHLY";
  const category = normalizeExpenseCategory(formData.get("category") as string);
  const dateStr = formData.get("date") as string;

  if (!description?.trim() || isNaN(amount)) {
    throw new Error("Popis a suma sú povinné");
  }
  if (!category) {
    throw new Error("Vyberte kategóriu výdavku");
  }

  await prisma.firmExpense.create({
    data: {
      description: description.trim(),
      amount,
      type: type || "ONE_TIME",
      category,
      date: dateStr ? new Date(dateStr) : new Date(),
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function toggleFirmExpense(id: string, active: boolean) {
  await prisma.firmExpense.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteFirmExpense(id: string) {
  await prisma.firmExpense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function createFirmIncome(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as string) || null;
  const dateStr = formData.get("date") as string;

  if (!description?.trim() || isNaN(amount)) {
    throw new Error("Popis a suma sú povinné");
  }

  await prisma.firmIncome.create({
    data: {
      description: description.trim(),
      amount,
      category,
      date: dateStr ? new Date(dateStr) : new Date(),
    },
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function deleteFirmIncome(id: string) {
  await prisma.firmIncome.delete({ where: { id } });
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

function parseInternalDocumentFields(formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const amount = parseFloat(String(formData.get("amount") ?? ""));
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  if (!description || isNaN(amount) || amount <= 0) {
    throw new Error("Vyplňte popis a sumu");
  }

  const countAsIncome = formData.get("countAsIncome") === "on";

  return { description, amount, date, countAsIncome };
}

function revalidateInternalDocumentPaths() {
  revalidatePath("/celkove-financie");
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function createInternalDocument(formData: FormData) {
  const { description, amount, date, countAsIncome } =
    parseInternalDocumentFields(formData);

  await prisma.$transaction(async (tx) => {
    let incomeId: string | undefined;
    if (countAsIncome) {
      const income = await tx.firmIncome.create({
        data: {
          description: `Interný doklad: ${description}`,
          amount,
          category: "Interný doklad",
          date,
        },
      });
      incomeId = income.id;
    }

    await tx.internalDocument.create({
      data: {
        description,
        amount,
        date,
        countAsIncome,
        incomeId,
      },
    });

    await adjustFirmCashInTransaction(tx, amount);
  });

  revalidateInternalDocumentPaths();
}

export async function updateInternalDocument(id: string, formData: FormData) {
  const { description, amount, date, countAsIncome } =
    parseInternalDocumentFields(formData);
  const doc = await prisma.internalDocument.findUnique({ where: { id } });
  if (!doc) {
    throw new Error("Doklad neexistuje");
  }

  const cashDelta = amount - doc.amount;

  await prisma.$transaction(async (tx) => {
    let incomeId: string | null = doc.incomeId;

    if (countAsIncome && !incomeId) {
      const income = await tx.firmIncome.create({
        data: {
          description: `Interný doklad: ${description}`,
          amount,
          category: "Interný doklad",
          date,
        },
      });
      incomeId = income.id;
    } else if (countAsIncome && incomeId) {
      await tx.firmIncome.update({
        where: { id: incomeId },
        data: {
          description: `Interný doklad: ${description}`,
          amount,
          date,
          category: "Interný doklad",
        },
      });
    } else if (!countAsIncome && incomeId) {
      await tx.firmIncome.delete({ where: { id: incomeId } });
      incomeId = null;
    }

    await tx.internalDocument.update({
      where: { id },
      data: {
        description,
        amount,
        date,
        countAsIncome,
        incomeId,
      },
    });

    if (cashDelta !== 0) {
      await adjustFirmCashInTransaction(tx, cashDelta);
    }
  });

  revalidateInternalDocumentPaths();
}

export async function deleteInternalDocument(id: string) {
  const doc = await prisma.internalDocument.findUnique({ where: { id } });
  if (!doc) return;

  await prisma.$transaction(async (tx) => {
    if (doc.incomeId) {
      await tx.firmIncome.delete({ where: { id: doc.incomeId } });
    }
    await tx.internalDocument.delete({ where: { id } });
    await adjustFirmCashInTransaction(tx, -doc.amount);
  });

  revalidateInternalDocumentPaths();
}

export async function toggleMaintenance(id: string, active: boolean) {
  await prisma.maintenanceContract.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/dashboard");
  revalidatePath("/clients");
}

export async function createRetainer(
  clientId: string,
  projectId: string | null,
  formData: FormData
) {
  const title = formData.get("title") as string;
  const monthlyAmount = parseFloat(formData.get("monthlyAmount") as string);
  const targetCount = parseInt(formData.get("targetCount") as string, 10);
  const deliverableLabel =
    (formData.get("deliverableLabel") as string)?.trim() || "videí";

  if (!title?.trim() || isNaN(monthlyAmount) || isNaN(targetCount) || targetCount < 1) {
    throw new Error("Vyplňte názov, sumu a počet");
  }

  await prisma.monthlyRetainer.create({
    data: {
      title: title.trim(),
      monthlyAmount,
      targetCount,
      deliverableLabel,
      clientId,
      projectId: projectId || undefined,
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
  });

  revalidatePath(`/clients/${clientId}`);
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function incrementRetainer(id: string) {
  const retainer = await prisma.monthlyRetainer.findUnique({ where: { id } });
  if (!retainer || !retainer.active) return;
  if (retainer.completedCount >= retainer.targetCount) return;

  const unitAmount = retainerUnitAmount(retainer);

  await prisma.$transaction(async (tx) => {
    await tx.monthlyRetainer.update({
      where: { id },
      data: {
        completedCount: retainer.completedCount + 1,
      },
    });
    await tx.retainerDelivery.create({
      data: {
        retainerId: id,
        amount: unitAmount,
        description: `${retainer.title} — ${retainer.deliverableLabel}`,
      },
    });
  });

  revalidateRetainerPaths(retainer.clientId, retainer.projectId);
}

export async function decrementRetainer(id: string) {
  const retainer = await prisma.monthlyRetainer.findUnique({ where: { id } });
  if (!retainer || retainer.completedCount <= 0) return;

  const periodStart = startOfMonth(new Date());
  const latestDelivery = await prisma.retainerDelivery.findFirst({
    where: { retainerId: id, date: { gte: periodStart } },
    orderBy: { date: "desc" },
  });
  if (!latestDelivery) return;

  await prisma.$transaction(async (tx) => {
    await tx.retainerDelivery.delete({ where: { id: latestDelivery.id } });
    await tx.monthlyRetainer.update({
      where: { id },
      data: { completedCount: retainer.completedCount - 1 },
    });
  });

  revalidateRetainerPaths(retainer.clientId, retainer.projectId);
}

export async function resetRetainerPeriod(id: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const retainer = await prisma.monthlyRetainer.update({
    where: { id },
    data: { completedCount: 0, periodStart },
  });

  revalidateRetainerPaths(retainer.clientId, retainer.projectId);
}

export async function toggleRetainer(id: string, active: boolean) {
  const retainer = await prisma.monthlyRetainer.update({
    where: { id },
    data: { active },
  });

  revalidateRetainerPaths(retainer.clientId, retainer.projectId);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function deleteRetainer(id: string) {
  const retainer = await prisma.monthlyRetainer.delete({ where: { id } });
  revalidateRetainerPaths(retainer.clientId, retainer.projectId);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

function revalidateRetainerPaths(clientId: string, projectId: string | null) {
  revalidatePath(`/clients/${clientId}`);
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
  revalidatePath("/celkove-financie");
}

export async function updateFirmBalance(formData: FormData) {
  const cardAmount = parseFloat(formData.get("cardAmount") as string);
  const cashAmount = parseFloat(formData.get("cashAmount") as string);
  const notes = (formData.get("notes") as string) || null;

  if (isNaN(cardAmount) || isNaN(cashAmount)) {
    throw new Error("Zadajte platné sumy");
  }

  await prisma.firmBalance.upsert({
    where: { id: "main" },
    update: { cardAmount, cashAmount, notes },
    create: { id: "main", cardAmount, cashAmount, notes },
  });

  revalidatePath("/celkove-financie");
}
