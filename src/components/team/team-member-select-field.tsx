import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type TeamMemberSelectOption = {
  id: string;
  name: string;
  role: string | null;
};

export function TeamMemberSelectField({
  members,
  name = "teamMemberId",
  id = "teamMemberId",
  label = "Komu (člen tímu)",
  defaultValue,
}: {
  members: TeamMemberSelectOption[];
  name?: string;
  id?: string;
  label?: string;
  defaultValue?: string;
}) {
  return (
    <FormField label={label} htmlFor={id}>
      <Select id={id} name={name} defaultValue={defaultValue ?? ""}>
        <option value="">— nie je to výplata členovi —</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
            {member.role ? ` · ${member.role}` : ""}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
