"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteItemButton({
  id,
  deleteAction,
}: {
  id: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={() => deleteAction(id)}>
      <Trash2 className="h-3.5 w-3.5 text-red-400" />
    </Button>
  );
}
