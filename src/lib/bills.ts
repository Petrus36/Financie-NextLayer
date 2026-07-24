import { PDFDocument } from "pdf-lib";

export const MAX_BILL_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

export function billHasFile(bill: {
  fileName: string | null;
  fileData: Uint8Array | null;
}) {
  return Boolean(bill.fileName && bill.fileData && bill.fileData.length > 0);
}

export function getBillDisplayTitle(bill: {
  vendor: string;
  title: string | null;
  invoiceNumber?: string | null;
  fileName?: string | null;
}) {
  if (bill.title?.trim() && bill.title !== bill.vendor) return bill.title.trim();
  if (bill.vendor?.trim()) return bill.vendor.trim();
  return bill.fileName ?? "Doklad";
}

export async function convertUploadToPdf(
  buffer: Buffer,
  mime: string,
  originalName: string
): Promise<{ fileName: string; fileMime: string; fileData: Buffer }> {
  if (mime === "application/pdf") {
    return {
      fileName: originalName.endsWith(".pdf")
        ? originalName
        : `${stripExtension(originalName)}.pdf`,
      fileMime: "application/pdf",
      fileData: buffer,
    };
  }

  if (!mime.startsWith("image/")) {
    throw new Error("Nahrajte PDF alebo fotku (JPG, PNG)");
  }

  if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/jpg") {
    throw new Error("Pre konverziu na PDF použite JPG alebo PNG");
  }

  const pdfDoc = await PDFDocument.create();
  const image =
    mime === "image/png"
      ? await pdfDoc.embedPng(buffer)
      : await pdfDoc.embedJpg(buffer);

  const { width, height } = image.scale(1);
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  const pdfBytes = await pdfDoc.save();

  return {
    fileName: `${stripExtension(originalName) || "doklad"}.pdf`,
    fileMime: "application/pdf",
    fileData: Buffer.from(pdfBytes),
  };
}

function stripExtension(name: string) {
  return name.replace(/\.[^.]+$/, "");
}
