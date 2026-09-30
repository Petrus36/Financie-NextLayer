import { updateManagedProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toDateInput(date?: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ProjectEditForm({
  project,
}: {
  project: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    deadline: Date | null;
  };
}) {
  const action = updateManagedProject.bind(null, project.id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Údaje projektu</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <FormField label="Názov" htmlFor="edit-title">
            <Input id="edit-title" name="title" required defaultValue={project.title} />
          </FormField>
          <FormField label="Cena" htmlFor="edit-price">
            <Input
              id="edit-price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={project.price}
            />
          </FormField>
          <FormField label="Deadline" htmlFor="edit-deadline">
            <Input
              id="edit-deadline"
              name="deadline"
              type="date"
              defaultValue={toDateInput(project.deadline)}
            />
          </FormField>
          <FormField label="Popis" htmlFor="edit-description">
            <Textarea
              id="edit-description"
              name="description"
              rows={3}
              defaultValue={project.description ?? ""}
            />
          </FormField>
          <Button type="submit" variant="secondary" className="w-full">
            Uložiť
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
