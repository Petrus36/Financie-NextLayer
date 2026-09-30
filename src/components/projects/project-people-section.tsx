import { addProjectMember, addProjectPayout, deleteProjectMember, deleteProjectPayout } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PROJECT_MEMBER_ROLES } from "@/lib/projects";
import { formatCurrency, formatDate } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  role: string;
  payouts: { id: string; amount: number; description: string; date: Date }[];
};

export function ProjectPeopleSection({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const addMember = addProjectMember.bind(null, projectId);
  const addPayout = addProjectPayout.bind(null, projectId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ľudia a výplaty</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Zatiaľ nikto nie je na projekte.
            </p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const paid = member.payouts.reduce((sum, p) => sum + p.amount, 0);
                return (
                  <div key={member.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{member.name}</p>
                        <p className="text-xs text-muted">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-amber-300">
                          {formatCurrency(paid)}
                        </span>
                        <DeleteItemButton
                          id={member.id}
                          deleteAction={(id) => deleteProjectMember(id, projectId)}
                        />
                      </div>
                    </div>
                    {member.payouts.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {member.payouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="flex items-center justify-between rounded-md bg-black/30 px-2 py-1.5"
                          >
                            <p className="text-xs text-zinc-400">
                              {payout.description} · {formatDate(payout.date)}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-zinc-200">
                                {formatCurrency(payout.amount)}
                              </span>
                              <DeleteItemButton
                                id={payout.id}
                                deleteAction={(id) => deleteProjectPayout(id, projectId)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Pridať človeka</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addMember} className="space-y-3">
              <FormField label="Meno" htmlFor="member-name">
                <Input id="member-name" name="name" required placeholder="Meno" />
              </FormField>
              <FormField label="Rola" htmlFor="member-role">
                <Select id="member-role" name="role" defaultValue="Strihanie videa">
                  {PROJECT_MEMBER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </FormField>
              <Button type="submit" className="w-full" variant="secondary">
                Pridať
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Výplata</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-sm text-muted">Najprv pridajte človeka.</p>
            ) : (
              <form action={addPayout} className="space-y-3">
                <FormField label="Komu" htmlFor="payout-member">
                  <Select id="payout-member" name="memberId" required>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} · {member.role}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Item" htmlFor="payout-description">
                  <Input
                    id="payout-description"
                    name="description"
                    required
                    placeholder="Strih, grafika..."
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Suma" htmlFor="payout-amount">
                    <Input
                      id="payout-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="€"
                    />
                  </FormField>
                  <FormField label="Dátum" htmlFor="payout-date">
                    <Input
                      id="payout-date"
                      name="date"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                    />
                  </FormField>
                </div>
                <Button type="submit" className="w-full">
                  Zaznamenať výplatu
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
