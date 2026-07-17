"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ServiceOrderPhoto } from "@/modules/service-orders/domain/service-order";
import { deletePhotoAction, savePhotoAction } from "../photo-actions";

/**
 * Fotos de uma etapa da OS (chegada ou conclusão).
 *
 * - O arquivo vai do navegador DIRETO para o storage (não passa pelo servidor):
 *   foto de celular tem vários MB e estouraria o limite de uma server action.
 * - O store é PRIVADO: a exibição passa pela rota /api/os-fotos/[id], que
 *   autentica e usa o RLS. Por isso usamos <img> comum — o otimizador do
 *   next/image busca pelo servidor, sem o cookie do usuário, e tomaria 401.
 * - No celular, o botão abre a câmera (`capture`).
 */
export function PhotoSection({
  serviceOrderId,
  kind,
  label,
  photos,
}: {
  serviceOrderId: string;
  kind: string;
  label: string;
  photos: ServiceOrderPhoto[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const blob = await upload(
        `os/${serviceOrderId}/${kind}-${file.name}`,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/os-fotos/upload",
        },
      );
      await savePhotoAction({ serviceOrderId, kind, url: blob.url });
      router.refresh();
    } catch {
      setError("Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">{label}</h4>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePick}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Adicionar foto
            </>
          )}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma foto ainda.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative aspect-square">
              <a
                href={`/api/os-fotos/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/os-fotos/${p.id}`}
                  alt={label}
                  className="h-full w-full rounded-md object-cover"
                  loading="lazy"
                />
              </a>
              <form
                action={deletePhotoAction}
                className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <input type="hidden" name="photoId" value={p.id} />
                <input
                  type="hidden"
                  name="serviceOrderId"
                  value={serviceOrderId}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="icon"
                  aria-label="Remover foto"
                  className="h-7 w-7"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
