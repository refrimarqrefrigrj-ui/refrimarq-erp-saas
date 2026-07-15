"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteCustomerAction } from "./actions";

export function DeleteCustomerButton({ id }: { id: string }) {
  return (
    <form
      action={deleteCustomerAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Excluir este cliente? Esta ação não pode ser desfeita.",
          )
        ) {
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
