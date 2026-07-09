"use client";

import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";

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
        className={`h-3.5 w-3.5 ${active ? "text-emerald-400" : "text-zinc-500"}`}
      />
    </Button>
  );
}
