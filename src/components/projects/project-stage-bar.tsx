import type { ProjectStage } from "@/generated/prisma/client";
import { updateProjectStage } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { PROJECT_STAGE_LABEL, PROJECT_STAGES } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function ProjectStageBar({
  projectId,
  current,
}: {
  projectId: string;
  current: ProjectStage;
}) {
  const action = updateProjectStage.bind(null, projectId);

  return (
    <div className="flex flex-wrap gap-2">
      {PROJECT_STAGES.map((stage) => (
        <form action={action} key={stage}>
          <input type="hidden" name="stage" value={stage} />
          <Button
            type="submit"
            size="sm"
            variant={current === stage ? "primary" : "secondary"}
            className={cn(current === stage && "pointer-events-none")}
          >
            {PROJECT_STAGE_LABEL[stage]}
          </Button>
        </form>
      ))}
    </div>
  );
}
