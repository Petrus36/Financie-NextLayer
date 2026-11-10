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
  return buildOpenPaymentQrPayload({
    iban: options.iban,
    bic: options.bic,
    beneficiaryName: options.beneficiaryName,
    amount: options.amount,
    dueAt: options.dueAt,
    variableSymbol: variableSymbol(options.invoiceNumber),
    invoiceId: options.invoiceNumber.replace(/\s/g, "").slice(0, 10),
    paymentNote:
      options.paymentNote?.slice(0, 140) ??
      `Faktura ${options.invoiceNumber}`.slice(0, 140),
  });
}

/**
 * Pay by Square QR for team / supplier payouts.
 * Omit amount so the bank app asks you to type it after scanning.
 */
export function buildOpenPaymentQrPayload(options: {
  iban: string;
  bic?: string | null;
  beneficiaryName: string;
  amount?: number | null;
  dueAt?: Date;
  variableSymbol?: string;
  invoiceId?: string;
  paymentNote?: string;
}) {
  const iban = normalizeIban(options.iban);
  if (!iban) return null;

  const bic = options.bic?.replace(/\s+/g, "").toUpperCase();
  const amount =
    options.amount != null && !Number.isNaN(options.amount) && options.amount > 0
      ? Math.round(options.amount * 100) / 100
      : undefined;

  return encode({
    invoiceId: options.invoiceId || undefined,
    payments: [
      {
        type: PaymentOptions.PaymentOrder,
        ...(amount != null ? { amount } : {}),
        currencyCode: "EUR",
        paymentDueDate: formatPayBySquareDate(options.dueAt ?? new Date()),
        variableSymbol: options.variableSymbol,
        paymentNote: options.paymentNote?.slice(0, 140),
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
