"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteEquipmentAction } from "./actions";

export function DeleteEquipmentButton({ id }: { id: string }) {
  return (
    <form
      action={deleteEquipmentAction}
      onSubmit={(e) => {
        if (!window.confirm("Excluir este equipamento?")) {
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
