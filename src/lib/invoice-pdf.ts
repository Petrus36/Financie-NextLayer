import { readFile } from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import { buildPayBySquareQrPayload } from "@/lib/pay-by-square-payload";

type InvoicePdfData = {
  number: string;
  issuedAt: Date;
  dueAt: Date;
  notes: string | null;
  items: { description: string; quantity: number; unit: string; unitPrice: number }[];
  client: {
    name: string;
    company: string | null;
    email: string | null;
    ico: string | null;
    dic: string | null;
    icDph: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
  };
  company: {
    name: string;
    ico: string | null;
    dic: string | null;
    icDph: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
    country: string;
    email: string | null;
    phone: string | null;
    website?: string | null;
    iban: string | null;
    bic: string | null;
    bankName: string | null;
    vatPayer: boolean;
    notes: string | null;
  };
};

const ink = rgb(0.07, 0.07, 0.07);
const muted = rgb(0.55, 0.55, 0.55);
const headerBg = rgb(0.965, 0.965, 0.965);
const lime = rgb(0.78, 1, 0.34);

function money(amount: number) {
  return `${amount.toFixed(2)} €`;
}

function formatSkDate(date: Date) {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function cityLine(zip?: string | null, city?: string | null) {
  return [zip, city].filter(Boolean).join(" ");
}

function draw(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = ink
) {
  page.drawText(text, { x, y, size, font, color });
}

export async function buildInvoicePdf(data: InvoicePdfData) {
  const fontsDir = path.join(process.cwd(), "src/lib/fonts");
  const assetsDir = path.join(process.cwd(), "src/lib/invoice-assets");
  const [regularBytes, boldBytes, headerBytes, footerBytes] = await Promise.all([
    readFile(path.join(fontsDir, "Arial.ttf")),
    readFile(path.join(fontsDir, "Arial-Bold.ttf")),
    readFile(path.join(assetsDir, "header.png")),
    readFile(path.join(assetsDir, "footer.png")),
  ]);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(regularBytes);
  const bold = await pdf.embedFont(boldBytes);
  const headerImage = await pdf.embedPng(headerBytes);
  const footerImage = await pdf.embedPng(footerBytes);
  const { width, height } = page.getSize();
  const left = 52;
  const right = width - 52;
  const mid = 318;
  const total = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const headerH = (headerImage.height / headerImage.width) * width;
  const footerH = (footerImage.height / footerImage.width) * width;
  page.drawImage(headerImage, {
    x: 0,
    y: height - headerH,
    width,
    height: headerH,
  });
  page.drawImage(footerImage, {
    x: 0,
    y: 0,
    width,
    height: footerH,
  });

  let y = height - headerH - 36;
  draw(page, "FAKTÚRA", left, y, bold, 28);
  const meta = [
    ["Dátum vystavenia:", formatSkDate(data.issuedAt)],
    ["Dátum splatnosti:", formatSkDate(data.dueAt)],
  ];
  meta.forEach(([label, value], i) => {
    const rowY = y + 14 - i * 15;
    draw(page, label, 330, rowY, font, 9, muted);
    draw(page, value, right - font.widthOfTextAtSize(value, 9), rowY, font, 9, ink);
  });

  y -= 22;
  draw(page, `č. ${data.number}`, left, y, font, 10, muted);
  draw(page, "Variabilný symbol:", 330, y, font, 9, muted);
  draw(page, data.number, right - font.widthOfTextAtSize(data.number, 9), y, font, 9, ink);

  y -= 36;
  draw(page, "DODÁVATEĽ", left, y, bold, 8, muted);
  draw(page, "ODBERATEĽ", mid, y, bold, 8, muted);

  const seller = [
    data.company.name,
    data.company.address,
    cityLine(data.company.zip, data.company.city),
    data.company.ico ? `IČO: ${data.company.ico}` : "",
  ].filter((line): line is string => Boolean(line));
  const sellerContact = [data.company.email, data.company.phone].filter(
    (line): line is string => Boolean(line)
  );

  const buyer = [
    data.client.company || data.client.name,
    data.client.address,
    cityLine(data.client.zip, data.client.city),
    data.client.ico ? `IČO: ${data.client.ico}` : "",
    data.client.dic ? `DIČ: ${data.client.dic}` : "",
    data.client.icDph ? `IČ DPH: ${data.client.icDph}` : "",
  ].filter((line): line is string => Boolean(line));

  y -= 16;
  const blockY = y;
  seller.forEach((text, i) => {
    draw(page, text, left, blockY - i * 13, i === 0 ? bold : font, 10);
  });
  sellerContact.forEach((text, i) => {
    draw(page, text, left, blockY - (seller.length + 1 + i) * 13, font, 10, muted);
  });
  buyer.forEach((text, i) => {
    draw(page, text, mid, blockY - i * 13, i === 0 ? bold : font, 10);
  });

  const sellerLines = seller.length + (sellerContact.length ? sellerContact.length + 1 : 0);
  y = blockY - Math.max(sellerLines, buyer.length) * 13 - 28;

  page.drawRectangle({
    x: left,
    y: y - 8,
    width: right - left,
    height: 24,
    color: headerBg,
  });
  draw(page, "Popis", left + 14, y, bold, 8, muted);
  draw(page, "Množ.", 348, y, bold, 8, muted);
  draw(page, "Jedn. cena", 448 - bold.widthOfTextAtSize("Jedn. cena", 8), y, bold, 8, muted);
  draw(page, "Celkom", right - 14 - bold.widthOfTextAtSize("Celkom", 8), y, bold, 8, muted);

  y -= 24;
  for (const item of data.items) {
    const amount = item.quantity * item.unitPrice;
    draw(page, item.description.slice(0, 42), left + 14, y, font, 10);
    const qty = String(item.quantity);
    draw(page, qty, 360 - font.widthOfTextAtSize(qty, 10) / 2, y, font, 10);
    const unitPrice = money(item.unitPrice);
    const amountText = money(amount);
    draw(page, unitPrice, 448 - font.widthOfTextAtSize(unitPrice, 10), y, font, 10);
    draw(page, amountText, right - 14 - font.widthOfTextAtSize(amountText, 10), y, font, 10);
    y -= 18;
  }

  y -= 22;
  draw(
    page,
    data.company.vatPayer ? "Sme platcovia DPH." : "Nie sme platcovia DPH.",
    left,
    y,
    font,
    9,
    muted
  );

  const boxW = 168;
  const boxH = 48;
  const boxX = right - boxW;
  const boxY = y - 14;
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    color: lime,
  });
  const totalLabel = "CELKOM K ÚHRADE";
  draw(
    page,
    totalLabel,
    boxX + (boxW - bold.widthOfTextAtSize(totalLabel, 8)) / 2,
    boxY + 30,
    bold,
    8,
    ink
  );
  const totalText = money(total);
  draw(
    page,
    totalText,
    boxX + (boxW - bold.widthOfTextAtSize(totalText, 16)) / 2,
    boxY + 10,
    bold,
    16
  );

  y = boxY - 40;
  draw(page, "Platobné údaje", left, y, bold, 10);
  y -= 18;
  if (data.company.iban) {
    draw(page, "IBAN:", left, y, font, 10, muted);
    draw(page, data.company.iban, left + 78, y, font, 10);
    y -= 14;
  }
  draw(page, "Variabilný symbol:", left, y, font, 10, muted);
  draw(page, data.number, left + 118, y, font, 10);

  if (data.company.iban) {
    try {
      const qrString = buildPayBySquareQrPayload({
        invoiceNumber: data.number,
        amount: total,
        dueAt: data.dueAt,
        iban: data.company.iban,
        bic: data.company.bic,
        beneficiaryName: data.company.name,
      });
      if (qrString) {
        const qrPng = await QRCode.toBuffer(qrString, {
          type: "png",
          margin: 2,
          width: 320,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#ffffff" },
        });
        const qrImage = await pdf.embedPng(qrPng);
        page.drawImage(qrImage, {
          x: right - 88,
          y: boxY - 122,
          width: 88,
          height: 88,
        });
      }
    } catch (err) {
      console.error("Pay by Square QR encode failed:", err);
    }
  }

  if (data.notes) {
    y -= 28;
    draw(page, data.notes, left, Math.max(y, footerH + 16), font, 9, muted);
  }

  return pdf.save();
}
