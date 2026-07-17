import { get } from "@vercel/blob";

import { getTenantContext } from "@/lib/auth/tenant";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";

/**
 * Serve a foto de uma OS.
 *
 * As fotos ficam em um store PRIVADO (não são acessíveis por URL pública).
 * Aqui: autenticamos, buscamos a foto pelo id — e o RLS garante que ela é da
 * empresa da sessão — e só então transmitimos o arquivo. Ou seja: nenhuma
 * empresa vê a foto de outra, e ninguém sem login vê nada.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getTenantContext();
  if (!ctx) {
    return new Response("Não autorizado", { status: 401 });
  }

  const { id } = await params;
  const photo = await drizzleServiceOrderRepository.getPhoto(ctx, id);
  if (!photo) {
    return new Response("Foto não encontrada", { status: 404 });
  }

  const result = await get(photo.url, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response("Arquivo indisponível", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "image/jpeg",
      // Cache no navegador do técnico; privado (nunca em cache compartilhado).
      "Cache-Control": "private, max-age=3600",
    },
  });
}
