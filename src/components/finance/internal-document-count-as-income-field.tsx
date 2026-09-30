export function InternalDocumentCountAsIncomeField({
  idSuffix = "",
  defaultChecked = true,
}: {
  idSuffix?: string;
  defaultChecked?: boolean;
}) {
  const id = `countAsIncome${idSuffix}`;
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-sm text-zinc-300">
      <input
        id={id}
        type="checkbox"
        name="countAsIncome"
        defaultChecked={defaultChecked}
        className="mt-1 accent-brand"
      />
      <span>Započítať do príjmov (štatistiky a Príjmy firmy)</span>
    </label>
  );
}
