import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { billHasFile } from "@/lib/bills";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const bill = await prisma.bill.findUnique({ where: { id } });

  if (!bill || !billHasFile(bill) || !bill.fileData || !bill.fileName) {
    notFound();
  }

  const { searchParams } = new URL(request.url);
  const forceDownload = searchParams.get("download") === "1";
  const fileName = bill.fileName.endsWith(".pdf")
    ? bill.fileName
    : `${bill.fileName}.pdf`;

  return new Response(new Uint8Array(bill.fileData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": forceDownload
        ? `attachment; filename="${encodeURIComponent(fileName)}"`
        : `inline; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
