import { auth } from "@/lib/auth";
import { buildOpenPaymentQrPayload } from "@/lib/pay-by-square-payload";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    iban?: string;
    bic?: string | null;
    amount?: number | null;
    note?: string | null;
  };

  const name = String(body.name ?? "").trim();
  const iban = String(body.iban ?? "").trim();
  if (!name || !iban) {
    return Response.json({ error: "Meno a IBAN sú povinné" }, { status: 400 });
  }

  const amount =
    body.amount != null && !Number.isNaN(Number(body.amount)) && Number(body.amount) > 0
      ? Number(body.amount)
      : null;

  const payload = buildOpenPaymentQrPayload({
    iban,
    bic: body.bic,
    beneficiaryName: name,
    amount,
    paymentNote: body.note?.trim() || `Platba pre ${name}`,
  });

  if (!payload) {
    return Response.json({ error: "IBAN nie je platný" }, { status: 400 });
  }

  const dataUrl = await QRCode.toDataURL(payload, {
    margin: 2,
    width: 280,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  return Response.json({ dataUrl });
}
