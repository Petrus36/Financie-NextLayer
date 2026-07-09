"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteExpenseButton({
  expenseId,
  projectId,
  deleteAction,
}: {
  expenseId: string;
  projectId: string;
  deleteAction: (expenseId: string, projectId: string) => Promise<void>;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => deleteAction(expenseId, projectId)}
    >
      <Trash2 className="h-3.5 w-3.5 text-red-400" />
    </Button>
  );
}
