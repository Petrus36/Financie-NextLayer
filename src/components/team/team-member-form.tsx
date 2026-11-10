import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type TeamMemberFormValues = {
  name?: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  iban?: string | null;
  bic?: string | null;
  bankName?: string | null;
};

export function TeamMemberForm({
  action,
  initial,
  submitLabel = "Uložiť",
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: TeamMemberFormValues;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Meno *" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="Ján Novák"
          />
        </FormField>
        <FormField label="Rola" htmlFor="role">
          <Input
            id="role"
            name="role"
            defaultValue={initial?.role ?? ""}
            placeholder="Kameraman, vývojár…"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            placeholder="jan@email.sk"
          />
        </FormField>
        <FormField label="Telefón" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            defaultValue={initial?.phone ?? ""}
            placeholder="+421…"
          />
        </FormField>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <p className="text-sm font-medium text-zinc-100">Bankové údaje</p>
        <p className="text-xs text-muted">
          IBAN stačí na QR platbu. BIC pomôže niektorým bankám.
        </p>
        <FormField label="IBAN" htmlFor="iban">
          <Input
            id="iban"
            name="iban"
            defaultValue={initial?.iban ?? ""}
            placeholder="SK…"
            autoComplete="off"
          />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="BIC / SWIFT" htmlFor="bic">
            <Input
              id="bic"
              name="bic"
              defaultValue={initial?.bic ?? ""}
              placeholder="TATRSKBX"
            />
          </FormField>
          <FormField label="Banka" htmlFor="bankName">
            <Input
              id="bankName"
              name="bankName"
              defaultValue={initial?.bankName ?? ""}
              placeholder="Tatra banka…"
            />
          </FormField>
        </div>
      </div>

      <FormField label="Poznámka" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          placeholder="Dohoda, sadzba, poznámky…"
        />
      </FormField>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
