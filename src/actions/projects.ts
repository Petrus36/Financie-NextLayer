"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectStage } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PROJECT_STAGES } from "@/lib/projects";

function revalidateProject(projectId: string, clientId?: string) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  if (clientId) revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

function parseStage(value: FormDataEntryValue | null): ProjectStage {
  const stage = String(value ?? "IN_PROGRESS");
  return PROJECT_STAGES.includes(stage as ProjectStage)
    ? (stage as ProjectStage)
    : "IN_PROGRESS";
}

function parseDeadline(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function statusForStage(stage: ProjectStage) {
  return stage === "DELIVERED" ? "DELIVERED" : "ACTIVE";
}

export async function createManagedProject(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = parseFloat(String(formData.get("price") ?? ""));
  const stage = parseStage(formData.get("stage"));
  const deadline = parseDeadline(formData.get("deadline"));

  if (!clientId || !title || isNaN(price) || price < 0) {
    throw new Error("Klient, názov a cena sú povinné");
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      price,
      clientId,
      stage,
      deadline,
      status: statusForStage(stage),
      deliveredAt: stage === "DELIVERED" ? new Date() : null,
    },
  });

  revalidateProject(project.id, clientId);
  redirect(`/projects/${project.id}`);
}

export async function updateManagedProject(projectId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = parseFloat(String(formData.get("price") ?? ""));
  const deadline = parseDeadline(formData.get("deadline"));

  if (!title || isNaN(price) || price < 0) {
    throw new Error("Názov a cena sú povinné");
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { title, description, price, deadline },
  });

  revalidateProject(projectId, project.clientId);
}

export async function updateProjectStage(projectId: string, formData: FormData) {
  const stage = parseStage(formData.get("stage"));
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      stage,
      status: statusForStage(stage),
      deliveredAt: stage === "DELIVERED" ? new Date() : null,
    },
  });

  revalidateProject(projectId, project.clientId);
}

export async function addProjectMember(projectId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || "Iné";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) throw new Error("Meno je povinné");

  await prisma.projectMember.create({
    data: { name, role, notes, projectId },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function deleteProjectMember(memberId: string, projectId: string) {
  await prisma.projectMember.delete({ where: { id: memberId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function addProjectPayout(projectId: string, formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amount = parseFloat(String(formData.get("amount") ?? ""));
  const dateStr = String(formData.get("date") ?? "");

  if (!memberId || !description || isNaN(amount) || amount <= 0) {
    throw new Error("Človek, popis a suma sú povinné");
  }

  await prisma.projectPayout.create({
    data: {
      memberId,
      projectId,
      description,
      amount,
      date: dateStr ? new Date(dateStr) : new Date(),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function deleteProjectPayout(payoutId: string, projectId: string) {
  await prisma.projectPayout.delete({ where: { id: payoutId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/statistics");
}

export async function addProjectTask(projectId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Úloha je povinná");

  await prisma.projectTask.create({
    data: { title, projectId },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function toggleProjectTask(taskId: string, projectId: string) {
  const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
  if (!task) return;

  await prisma.projectTask.update({
    where: { id: taskId },
    data: { done: !task.done },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function deleteProjectTask(taskId: string, projectId: string) {
  await prisma.projectTask.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${projectId}`);
}
