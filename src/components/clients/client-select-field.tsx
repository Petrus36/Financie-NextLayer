import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type ClientSelectOption = {
  id: string;
  name: string;
  company: string | null;
};

export function ClientSelectField({
  clients,
  name = "clientId",
  id = "clientId",
  label,
  optional = false,
  defaultValue,
}: {
  clients: ClientSelectOption[];
  name?: string;
  id?: string;
  label: string;
  optional?: boolean;
  defaultValue?: string;
}) {
  return (
    <FormField label={label} htmlFor={id}>
      <Select
        id={id}
        name={name}
        required={!optional}
        defaultValue={defaultValue ?? (optional ? "" : "")}
      >
        {optional && <option value="">— všeobecný náklad —</option>}
        {!optional && (
          <option value="" disabled>
            Vyberte klienta
          </option>
        )}
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
            {client.company ? ` · ${client.company}` : ""}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
