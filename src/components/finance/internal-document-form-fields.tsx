import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { InternalDocumentCountAsIncomeField } from "@/components/finance/internal-document-count-as-income-field";

type ClientOption = { id: string; name: string; company: string | null };

export function InternalDocumentFormFields({
  clients,
  defaultClientId,
  idPrefix = "",
  defaultDescription,
  defaultAmount,
  defaultDate,
  defaultCountAsIncome = true,
}: {
  clients: ClientOption[];
  defaultClientId?: string;
  idPrefix?: string;
  defaultDescription?: string;
  defaultAmount?: number;
  defaultDate?: string;
  defaultCountAsIncome?: boolean;
}) {
  return (
    <>
      <FormField label="Klient (kto platil)" htmlFor={`${idPrefix}clientId`}>
        <Select
          id={`${idPrefix}clientId`}
          name="clientId"
          required
          defaultValue={defaultClientId ?? ""}
        >
          <option value="" disabled>
            Vyberte klienta
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.company ? ` · ${client.company}` : ""}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Item" htmlFor={`${idPrefix}description`}>
        <Input
          id={`${idPrefix}description`}
          name="description"
          required
          placeholder="Popis príjmu"
          defaultValue={defaultDescription}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Suma" htmlFor={`${idPrefix}amount`}>
          <Input
            id={`${idPrefix}amount`}
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="€"
            defaultValue={defaultAmount}
          />
        </FormField>
        <FormField label="Dátum" htmlFor={`${idPrefix}date`}>
          <Input
            id={`${idPrefix}date`}
            name="date"
            type="date"
            defaultValue={
              defaultDate ?? new Date().toISOString().slice(0, 10)
            }
          />
        </FormField>
      </div>
      <InternalDocumentCountAsIncomeField
        idSuffix={idPrefix}
        defaultChecked={defaultCountAsIncome}
      />
    </>
  );
}
