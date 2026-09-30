import { addProjectTask, deleteProjectTask, toggleProjectTask } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteItemButton } from "@/components/ui/delete-item-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Task = { id: string; title: string; done: boolean };

export function ProjectTasksSection({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: Task[];
}) {
  const addTask = addProjectTask.bind(null, projectId);
  const doneCount = tasks.filter((task) => task.done).length;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Checklist {tasks.length > 0 ? `· ${pct}%` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length > 0 && (
          <div className="h-2 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </div>
        )}

        {tasks.length === 0 ? (
          <p className="text-sm text-muted">Žiadne úlohy — pridajte čo ostáva spraviť.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <form action={toggleProjectTask.bind(null, task.id, projectId)}>
                  <Button type="submit" size="sm" variant="ghost" className="px-2">
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        task.done
                          ? "border-brand bg-brand text-black"
                          : "border-zinc-500"
                      )}
                    >
                      {task.done ? "✓" : ""}
                    </span>
                  </Button>
                </form>
                <p
                  className={cn(
                    "flex-1 text-sm",
                    task.done ? "text-muted line-through" : "text-zinc-200"
                  )}
                >
                  {task.title}
                </p>
                <DeleteItemButton
                  id={task.id}
                  deleteAction={(id) => deleteProjectTask(id, projectId)}
                />
              </div>
            ))}
          </div>
        )}

        <form action={addTask} className="flex gap-2">
          <Input name="title" required placeholder="Ďalšia úloha..." />
          <Button type="submit" variant="secondary">
            Pridať
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
