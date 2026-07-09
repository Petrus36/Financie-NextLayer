"use client";

import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToggleActiveButton({
  id,
  active,
  toggleAction,
}: {
  id: string;
  active: boolean;
  toggleAction: (id: string, active: boolean) => Promise<void>;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleAction(id, !active)}
      title={active ? "Deaktivovať" : "Aktivovať"}
    >
      <Power
        className={`h-3.5 w-3.5 ${active ? "text-brand" : "text-muted"}`}
      />
    </Button>
  );
}
