"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const company = (formData.get("company") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!name?.trim()) {
    throw new Error("Meno klienta je povinné");
  }

  const client = await prisma.client.create({
    data: { name: name.trim(), email, phone, company, notes },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const company = (formData.get("company") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  await prisma.client.update({
    where: { id },
    data: { name: name.trim(), email, phone, company, notes },
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
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
}

export async function deleteProjectExpense(expenseId: string, projectId: string) {
  await prisma.projectExpense.delete({ where: { id: expenseId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deliverProject(projectId: string, formData: FormData) {
  const maintenanceAmount = formData.get("maintenanceAmount") as string;
  const maintenanceNotes = (formData.get("maintenanceNotes") as string) || null;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date(),
    },
  });

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
  revalidatePath(`/clients/${project.clientId}`);
  revalidatePath("/dashboard");
}

export async function createFirmExpense(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as "ONE_TIME" | "MONTHLY";
  const category = (formData.get("category") as string) || null;
  const dateStr = formData.get("date") as string;

  if (!description?.trim() || isNaN(amount)) {
    throw new Error("Popis a suma sú povinné");
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
}

export async function deleteFirmIncome(id: string) {
  await prisma.firmIncome.delete({ where: { id } });
  revalidatePath("/income");
  revalidatePath("/dashboard");
}

export async function toggleMaintenance(id: string, active: boolean) {
  await prisma.maintenanceContract.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/dashboard");
  revalidatePath("/clients");
}
