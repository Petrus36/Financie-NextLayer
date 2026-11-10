"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function normalizeOptional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function normalizeIban(value: FormDataEntryValue | null) {
  const text = String(value ?? "").replace(/\s+/g, "").toUpperCase();
  return text || null;
}

function parseTeamMemberFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Meno je povinné");

  return {
    name,
    role: normalizeOptional(formData.get("role")),
    email: normalizeOptional(formData.get("email")),
    phone: normalizeOptional(formData.get("phone")),
    notes: normalizeOptional(formData.get("notes")),
    iban: normalizeIban(formData.get("iban")),
    bic: normalizeOptional(formData.get("bic"))?.replace(/\s+/g, "").toUpperCase() ?? null,
    bankName: normalizeOptional(formData.get("bankName")),
  };
}

function revalidateTeam(id?: string) {
  revalidatePath("/team");
  revalidatePath("/expenses");
  if (id) revalidatePath(`/team/${id}`);
}

export async function createTeamMember(formData: FormData) {
  const data = parseTeamMemberFields(formData);
  const member = await prisma.teamMember.create({ data });
  revalidateTeam(member.id);
  redirect(`/team/${member.id}`);
}

export async function updateTeamMember(id: string, formData: FormData) {
  const data = parseTeamMemberFields(formData);
  await prisma.teamMember.update({ where: { id }, data });
  revalidateTeam(id);
  redirect(`/team/${id}`);
}

export async function setTeamMemberActive(id: string, active: boolean) {
  await prisma.teamMember.update({ where: { id }, data: { active } });
  revalidateTeam(id);
}

export async function deleteTeamMember(id: string) {
  // Soft-safe: expenses keep history (teamMemberId set null via relation), then delete card
  await prisma.teamMember.delete({ where: { id } });
  revalidateTeam();
  redirect("/team");
}
