"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  MAX_BILL_FILE_BYTES,
  convertUploadToPdf,
} from "@/lib/bills";

function revalidateBills() {
  revalidatePath("/bills");
}

export async function uploadBillScan(formData: FormData) {
  const file = formData.get("file") as File | null;
  const name = String(formData.get("name") ?? "").trim() || "Doklad";

  if (!file || file.size === 0) {
    throw new Error("Vyberte súbor na nahratie");
  }

  if (file.size > MAX_BILL_FILE_BYTES) {
    throw new Error("Súbor je príliš veľký (max. 8 MB)");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const pdf = await convertUploadToPdf(buffer, mime, file.name);

  const bill = await prisma.bill.create({
    data: {
      vendor: name,
      title: name,
      source: "SCAN",
      status: "DONE",
      fileName: pdf.fileName,
      fileMime: pdf.fileMime,
      fileData: new Uint8Array(pdf.fileData),
    },
  });

  revalidateBills();
  redirect(`/bills/${bill.id}`);
}

export async function deleteBill(id: string) {
  await prisma.bill.delete({ where: { id } });
  revalidateBills();
  redirect("/bills");
}
