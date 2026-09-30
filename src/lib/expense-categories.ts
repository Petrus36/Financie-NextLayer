export const FIRM_EXPENSE_CATEGORIES = [
  "Strihanie videa",
  "Grafika",
  "Nájom",
  "Software",
  "Marketing",
  "Doprava",
  "Iné",
] as const;

export type FirmExpenseCategory = (typeof FIRM_EXPENSE_CATEGORIES)[number];

export function normalizeExpenseCategory(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const match = FIRM_EXPENSE_CATEGORIES.find(
    (category) => category.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? trimmed;
}
