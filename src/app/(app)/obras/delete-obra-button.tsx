"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteObraAction } from "./actions";

export function DeleteObraButton({ id }: { id: string }) {
  return (
    <form
      action={deleteObraAction}
      onSubmit={(e) => {
        if (!window.confirm("Excluir esta obra?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="outline"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </Button>
    </form>
  );
}
