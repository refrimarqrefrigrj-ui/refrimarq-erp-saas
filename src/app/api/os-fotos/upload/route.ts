import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/auth/tenant";

/**
 * Emite o token para o navegador enviar a foto DIRETO ao storage (Vercel Blob).
 *
 * Por que direto: foto de celular tem vários MB e estouraria o limite de corpo
 * de uma server action. O arquivo não passa pelo nosso servidor — só o token.
 * A URL final é salva no banco por uma server action depois do upload.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Só usuário autenticado (de uma empresa) pode subir foto.
        await requireTenantContext();
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Não usamos: o cliente salva a URL via server action (funciona
        // igual em localhost e em produção).
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
