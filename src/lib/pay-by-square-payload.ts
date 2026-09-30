import { encode, PaymentOptions } from "bysquare/pay";

function formatPayBySquareDate(date: Date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function normalizeIban(iban: string) {
  return iban.replace(/\s+/g, "").toUpperCase();
}

/** VS must be up to 10 digits for Pay by Square / Slovak banks. */
function variableSymbol(invoiceNumber: string) {
  const digits = invoiceNumber.replace(/\D/g, "");
  if (!digits) return undefined;
  return digits.length <= 10 ? digits : digits.slice(-10);
}

/** Pay by Square QR payload (SBA standard — not Czech SPD). */
export function buildPayBySquareQrPayload(options: {
  invoiceNumber: string;
  amount: number;
  dueAt: Date;
  iban: string;
  bic?: string | null;
  beneficiaryName: string;
  paymentNote?: string;
}) {
  const iban = normalizeIban(options.iban);
  if (!iban) return null;

  const bic = options.bic?.replace(/\s+/g, "").toUpperCase();
  const invoiceId = options.invoiceNumber.replace(/\s/g, "").slice(0, 10);
  const vs = variableSymbol(options.invoiceNumber);

  return encode({
    invoiceId: invoiceId || undefined,
    payments: [
      {
        type: PaymentOptions.PaymentOrder,
        amount: Math.round(options.amount * 100) / 100,
        currencyCode: "EUR",
        paymentDueDate: formatPayBySquareDate(options.dueAt),
        variableSymbol: vs,
        paymentNote:
          options.paymentNote?.slice(0, 140) ??
          `Faktura ${options.invoiceNumber}`.slice(0, 140),
        bankAccounts: [
          {
            iban,
            ...(bic ? { bic } : {}),
          },
        ],
        beneficiary: {
          name: options.beneficiaryName.slice(0, 70),
        },
      },
    ],
  });
}
