import { prisma } from "@/lib/prisma";
import type { CompanySettings } from "@/generated/prisma/client";

const NEXTLAYER_WEBSITE = "nextlayer.studio";

const NEXTLAYER_DEFAULTS = {
  name: "NextLayer Studio s.r.o.",
  ico: "57141282",
  dic: "2120380240",
  icDph: "SK2120380240",
  address: "Wienerova alej 929/20",
  city: "Miloslavov",
  zip: "900 42",
  country: "Slovensko",
  email: "team@nextlayer.studio",
  phone: "+421 902 238 309",
  iban: "SK10 1100 0000 0029 4927 5915",
  vatPayer: false,
  defaultDueDays: 14,
};

function withWebsite(settings: CompanySettings) {
  return {
    ...settings,
    website: NEXTLAYER_WEBSITE,
  };
}

export async function getCompanySettings() {
  const settings = await prisma.companySettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      ...NEXTLAYER_DEFAULTS,
    },
  });

  if (!settings.ico || !settings.iban) {
    const filled = await prisma.companySettings.update({
      where: { id: "main" },
      data: {
        ico: settings.ico ?? NEXTLAYER_DEFAULTS.ico,
        dic: settings.dic ?? NEXTLAYER_DEFAULTS.dic,
        icDph: settings.icDph ?? NEXTLAYER_DEFAULTS.icDph,
        address: settings.address ?? NEXTLAYER_DEFAULTS.address,
        city: settings.city ?? NEXTLAYER_DEFAULTS.city,
        zip: settings.zip ?? NEXTLAYER_DEFAULTS.zip,
        email: settings.email ?? NEXTLAYER_DEFAULTS.email,
        phone: settings.phone ?? NEXTLAYER_DEFAULTS.phone,
        iban: settings.iban ?? NEXTLAYER_DEFAULTS.iban,
      },
    });
    return withWebsite(filled);
  }

  return withWebsite(settings);
}

const LAST_EXTERNAL_INVOICE = "2026059";

function invoiceNumberValue(number: string) {
  const parsed = parseInt(number.replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function nextInvoiceNumber() {
  const invoices = await prisma.invoice.findMany({
    select: { number: true },
  });
  const used = new Set(invoices.map((invoice) => invoice.number));
  let next =
    Math.max(
      invoiceNumberValue(LAST_EXTERNAL_INVOICE),
      ...invoices.map((invoice) => invoiceNumberValue(invoice.number))
    ) + 1;

  let candidate = String(next);
  while (used.has(candidate)) {
    next += 1;
    candidate = String(next);
  }

  return candidate;
}
